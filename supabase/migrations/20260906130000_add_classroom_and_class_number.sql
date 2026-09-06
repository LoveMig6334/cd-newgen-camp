-- Add classroom (ห้อง, e.g. "3/1") and seat number (เลขที่) to applications.
-- Run in Supabase SQL Editor (or `supabase db push`).

BEGIN;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS classroom text,
  ADD COLUMN IF NOT EXISTS class_number smallint;

-- classroom looks like "<grade>/<room>", e.g. 3/1, 5/2
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_classroom_format;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_classroom_format
  CHECK (classroom IS NULL OR classroom ~ '^[1-6]/[1-9]$');

-- seat number 1–60
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_class_number_range;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_class_number_range
  CHECK (class_number IS NULL OR class_number BETWEEN 1 AND 60);

COMMIT;

-- Optional: once existing rows have been backfilled, make both required:
-- ALTER TABLE public.applications
--   ALTER COLUMN classroom SET NOT NULL,
--   ALTER COLUMN class_number SET NOT NULL;
