-- Prompt Battle submissions for CD AI Innovation Bootcamp 2026.
-- Run in Supabase SQL Editor (or `supabase db push`).
--
-- Students are the rows of `applications` for the 2026/next-gen-ai-academy
-- event. Every submission is kept (history); the gallery shows the latest
-- one per student. Anon has no direct table access: the public page reads the
-- participant list and submits only through the SECURITY DEFINER functions
-- below, which re-check the participant and the size limits.

BEGIN;

CREATE TABLE IF NOT EXISTS public.prompt_battle_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  application_id uuid NOT NULL REFERENCES public.applications (id) ON DELETE CASCADE,
  prompt text NOT NULL CHECK (char_length(btrim(prompt)) > 0 AND char_length(prompt) <= 10000),
  html text NOT NULL CHECK (char_length(btrim(html)) > 0 AND octet_length(html) <= 2097152),
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prompt_battle_submissions_latest_idx
  ON public.prompt_battle_submissions (event_id, application_id, submitted_at DESC);

ALTER TABLE public.prompt_battle_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read prompt battle submissions"
  ON public.prompt_battle_submissions;
CREATE POLICY "Authenticated users can read prompt battle submissions"
  ON public.prompt_battle_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Participants for the dropdown: only what is needed to pick a name.
CREATE OR REPLACE FUNCTION public.prompt_battle_participants()
RETURNS TABLE (id uuid, first_name text, last_initial text, nickname text, classroom text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id,
         a.first_name::text,
         left(a.last_name, 1)::text,
         a.nickname::text,
         a.classroom::text
  FROM applications a
  JOIN events e ON e.id = a.event_id
  WHERE e.year = 2026 AND e.slug = 'next-gen-ai-academy'
  ORDER BY a.classroom NULLS LAST, a.class_number NULLS LAST, a.first_name;
$$;

CREATE OR REPLACE FUNCTION public.submit_prompt_battle(
  p_application_id uuid,
  p_prompt text,
  p_html text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
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

  INSERT INTO prompt_battle_submissions (event_id, application_id, prompt, html)
  VALUES (v_event_id, p_application_id, p_prompt, p_html)
  RETURNING submitted_at INTO v_submitted_at;

  RETURN v_submitted_at;
END;
$$;

REVOKE ALL ON FUNCTION public.prompt_battle_participants() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_prompt_battle(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prompt_battle_participants() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_prompt_battle(uuid, text, text) TO anon, authenticated;

COMMIT;
