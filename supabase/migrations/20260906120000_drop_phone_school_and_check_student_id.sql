-- Remove phone and school from applications; enforce 4-digit student_id.
-- Run in Supabase SQL Editor (or `supabase db push`).

BEGIN;

ALTER TABLE public.applications
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS school;

-- student_id is required and must be exactly 4 digits.
ALTER TABLE public.applications
  ALTER COLUMN student_id SET NOT NULL;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_student_id_format;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_student_id_format
  CHECK (student_id ~ '^[0-9]{4}$');

COMMIT;
