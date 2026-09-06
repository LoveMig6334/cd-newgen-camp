-- Add nickname (ชื่อเล่น) to applications.
-- Run in Supabase SQL Editor (or `supabase db push`).

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS nickname text;

-- Optional: once existing rows have been backfilled, make it required:
-- ALTER TABLE public.applications ALTER COLUMN nickname SET NOT NULL;
