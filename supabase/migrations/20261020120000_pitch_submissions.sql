-- Prototype PITCH submissions for CD AI Innovation Bootcamp 2026.
-- Run in Supabase SQL Editor (or `supabase db push`).
--
-- Same pattern as prompt_battle_submissions: students are the 2026
-- next-gen-ai-academy applicants (dropdown uses prompt_battle_participants()),
-- every submission is kept and the latest per student wins, anon has no direct
-- table access and writes only through submit_pitch(), which re-checks the
-- participant, sizes, link scheme and the sketch's magic bytes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.pitch_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  problem text NOT NULL CHECK (char_length(btrim(problem)) > 0 AND char_length(problem) <= 500),
  hmw text NOT NULL CHECK (char_length(btrim(hmw)) > 0 AND char_length(hmw) <= 300),
  idea text NOT NULL CHECK (char_length(btrim(idea)) > 0 AND char_length(idea) <= 500),
  html text CHECK (html IS NULL OR (char_length(btrim(html)) > 0 AND octet_length(html) <= 2097152)),
  link_url text CHECK (link_url IS NULL OR (link_url ~* '^https?://[^[:space:]]+$' AND char_length(link_url) <= 2000)),
  sketch bytea CHECK (sketch IS NULL OR octet_length(sketch) <= 5242880),
  sketch_mime text CHECK (sketch_mime IN ('image/png', 'image/jpeg', 'image/webp')),
  has_html boolean GENERATED ALWAYS AS (html IS NOT NULL) STORED,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  CHECK (html IS NOT NULL OR link_url IS NOT NULL),
  CHECK ((sketch IS NULL) = (sketch_mime IS NULL))
);

CREATE INDEX IF NOT EXISTS pitch_submissions_latest_idx
  ON public.pitch_submissions (event_id, application_id, submitted_at DESC);

ALTER TABLE public.pitch_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read pitch submissions"
  ON public.pitch_submissions;
CREATE POLICY "Authenticated users can read pitch submissions"
  ON public.pitch_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION public.submit_pitch(
  p_application_id uuid,
  p_problem text,
  p_hmw text,
  p_idea text,
  p_html text,
  p_link_url text,
  p_sketch_base64 text,
  p_sketch_mime text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
  v_sketch bytea;
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

  IF p_sketch_base64 IS NOT NULL THEN
    v_sketch := decode(p_sketch_base64, 'base64');
    -- The declared type must match the file's magic bytes.
    IF NOT (
      (p_sketch_mime = 'image/png' AND substring(v_sketch FROM 1 FOR 8) = '\x89504e470d0a1a0a'::bytea)
      OR (p_sketch_mime = 'image/jpeg' AND substring(v_sketch FROM 1 FOR 3) = '\xffd8ff'::bytea)
      OR (p_sketch_mime = 'image/webp' AND substring(v_sketch FROM 1 FOR 4) = '\x52494646'::bytea
          AND substring(v_sketch FROM 9 FOR 4) = '\x57454250'::bytea)
    ) THEN
      RAISE EXCEPTION 'invalid sketch image' USING ERRCODE = '23514';
    END IF;
  END IF;

  INSERT INTO pitch_submissions
    (event_id, application_id, problem, hmw, idea, html, link_url, sketch, sketch_mime)
  VALUES
    (v_event_id, p_application_id, p_problem, p_hmw, p_idea, p_html, p_link_url,
     v_sketch, CASE WHEN v_sketch IS NULL THEN NULL ELSE p_sketch_mime END)
  RETURNING submitted_at INTO v_submitted_at;

  RETURN v_submitted_at;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_pitch(uuid, text, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_pitch(uuid, text, text, text, text, text, text, text) TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
