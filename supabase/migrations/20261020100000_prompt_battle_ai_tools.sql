-- Prompt Battle: record which AI tools (Claude, ChatGPT, ...) a student used.
-- Run in Supabase SQL Editor (or `supabase db push`).
--
-- Safe to run while the previous app version is live: the new p_ai_tools
-- parameter has a default, so 3-argument calls keep working.

BEGIN;

ALTER TABLE public.prompt_battle_submissions
  ADD COLUMN IF NOT EXISTS ai_tools text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.prompt_battle_submissions
  DROP CONSTRAINT IF EXISTS prompt_battle_submissions_ai_tools_check;
ALTER TABLE public.prompt_battle_submissions
  ADD CONSTRAINT prompt_battle_submissions_ai_tools_check
  CHECK (cardinality(ai_tools) <= 6);

DROP FUNCTION IF EXISTS public.submit_prompt_battle(uuid, text, text);

CREATE OR REPLACE FUNCTION public.submit_prompt_battle(
  p_application_id uuid,
  p_prompt text,
  p_html text,
  p_ai_tools text[] DEFAULT '{}'
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

  IF EXISTS (
    SELECT 1 FROM unnest(coalesce(p_ai_tools, '{}')) t
    WHERE char_length(btrim(t)) = 0 OR char_length(t) > 40
  ) THEN
    RAISE EXCEPTION 'invalid ai tool' USING ERRCODE = '23514';
  END IF;

  INSERT INTO prompt_battle_submissions (event_id, application_id, prompt, html, ai_tools)
  VALUES (v_event_id, p_application_id, p_prompt, p_html, coalesce(p_ai_tools, '{}'))
  RETURNING submitted_at INTO v_submitted_at;

  RETURN v_submitted_at;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_prompt_battle(uuid, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_prompt_battle(uuid, text, text, text[]) TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
