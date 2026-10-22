-- Final Project submissions for CD AI Innovation Bootcamp 2026.
-- Run in Supabase SQL Editor (or `supabase db push`).
--
-- Students send the link to their deployed site and a pitch deck PDF. The PDF
-- is uploaded from the browser straight into the private `final-project-decks`
-- Storage bucket (Vercel caps API request bodies at 4.5 MB), at
-- `<application id>/<random uuid>.pdf`. Anon may only INSERT there, into a
-- real participant's folder, as application/pdf up to 30 MB; only
-- authenticated users (TAs) can read. submit_final_project() checks the
-- participant, the link and that the uploaded object exists, then records it.
-- Every submission is kept and the latest per student wins.
-- pitch_submissions (Prototype PITCH) is left untouched.

BEGIN;

CREATE TABLE IF NOT EXISTS public.final_project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  deploy_url text NOT NULL
    CHECK (deploy_url ~* '^https?://[^[:space:]]+$' AND char_length(deploy_url) <= 2000),
  deck_path text NOT NULL
    CHECK (deck_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.pdf$'),
  deck_size bigint,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS final_project_submissions_latest_idx
  ON public.final_project_submissions (event_id, application_id, submitted_at DESC);

ALTER TABLE public.final_project_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read final project submissions"
  ON public.final_project_submissions;
CREATE POLICY "Authenticated users can read final project submissions"
  ON public.final_project_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Storage bucket for the decks (private; size and type enforced by Storage).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('final-project-decks', 'final-project-decks', false, 31457280, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- True when `p_name` is `<participant application id>/<uuid>.pdf`.
-- SECURITY DEFINER so the storage policy can look up applications for anon.
CREATE OR REPLACE FUNCTION public.final_project_deck_path_ok(p_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_name IS NULL
     OR p_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$'
  THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM applications a
    JOIN events e ON e.id = a.event_id
    WHERE a.id = split_part(p_name, '/', 1)::uuid
      AND e.year = 2026 AND e.slug = 'next-gen-ai-academy'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.final_project_deck_path_ok(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.final_project_deck_path_ok(text) TO anon, authenticated;

-- Upload only (no read, overwrite or delete) into a participant's folder.
DROP POLICY IF EXISTS "Participants can upload final project decks" ON storage.objects;
CREATE POLICY "Participants can upload final project decks"
  ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'final-project-decks'
    AND public.final_project_deck_path_ok(name)
  );

DROP POLICY IF EXISTS "Authenticated users can read final project decks" ON storage.objects;
CREATE POLICY "Authenticated users can read final project decks"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'final-project-decks');

CREATE OR REPLACE FUNCTION public.submit_final_project(
  p_application_id uuid,
  p_deploy_url text,
  p_deck_path text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_deck_size bigint;
  v_submitted_at timestamptz;
BEGIN
  SELECT a.event_id INTO v_event_id
  FROM applications a
  JOIN events e ON e.id = a.event_id
  WHERE a.id = p_application_id
    AND e.year = 2026 AND e.slug = 'next-gen-ai-academy';

  IF v_event_id IS NULL THEN
    RAISE EXCEPTION 'not a participant' USING ERRCODE = 'P0002';
  END IF;

  IF split_part(p_deck_path, '/', 1) <> p_application_id::text
     OR NOT public.final_project_deck_path_ok(p_deck_path) THEN
    RAISE EXCEPTION 'invalid deck path' USING ERRCODE = '22023';
  END IF;

  SELECT (o.metadata ->> 'size')::bigint INTO v_deck_size
  FROM storage.objects o
  WHERE o.bucket_id = 'final-project-decks' AND o.name = p_deck_path;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'deck not uploaded' USING ERRCODE = '22023';
  END IF;

  INSERT INTO final_project_submissions
    (event_id, application_id, deploy_url, deck_path, deck_size)
  VALUES
    (v_event_id, p_application_id, p_deploy_url, p_deck_path, v_deck_size)
  RETURNING submitted_at INTO v_submitted_at;

  RETURN v_submitted_at;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_final_project(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_final_project(uuid, text, text) TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
