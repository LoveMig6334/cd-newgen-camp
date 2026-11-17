-- Secret Santa draw (/secret-santa, admin at /admin/secret-santa).
-- Run in Supabase SQL Editor (or `supabase db push`).
--
-- Privacy by design: nothing ever records who got whom. A round keeps only
--   participants  every name the admin typed (admin's order)
--   drawn         names that have already drawn — kept sorted, so the order
--                 people drew in isn't kept either
--   pool          names nobody has drawn yet
-- secret_santa_draw() picks a name from the pool, removes it and returns it to
-- the person drawing; the pair exists only on their screen. There are no
-- per-draw timestamps. The table has RLS on and no policies, so neither anon
-- nor signed-in admins can read it directly — only through the functions,
-- which never return the pool.
--
-- No one draws themselves, and the draw never paints itself into a corner:
-- when only one other person is left to draw and they are still in the pool,
-- the current drawer gets them (otherwise the last person would be left with
-- only their own name).

BEGIN;

CREATE TABLE IF NOT EXISTS public.secret_santa_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants text[] NOT NULL CHECK (cardinality(participants) BETWEEN 3 AND 200),
  drawn text[] NOT NULL DEFAULT '{}',
  pool text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.secret_santa_rounds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.secret_santa_rounds FROM anon, authenticated;

-- Current round: who still has to draw (never the pool).
CREATE OR REPLACE FUNCTION public.secret_santa_status()
RETURNS TABLE (round_id uuid, total int, drawn_count int, waiting text[])
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id,
         cardinality(r.participants),
         cardinality(r.drawn),
         ARRAY(
           SELECT p FROM unnest(r.participants) WITH ORDINALITY AS t(p, i)
           WHERE NOT (p = ANY (r.drawn))
           ORDER BY i
         )
  FROM secret_santa_rounds r
  ORDER BY r.created_at DESC
  LIMIT 1;
$$;

-- The person `p_name` draws. Returns the name they give a gift to.
CREATE OR REPLACE FUNCTION public.secret_santa_draw(p_round_id uuid, p_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r secret_santa_rounds%ROWTYPE;
  v_others text[];
  v_choices text[];
  v_pick text;
BEGIN
  SELECT * INTO r FROM secret_santa_rounds WHERE id = p_round_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'round_gone' USING ERRCODE = 'P0002';
  END IF;
  IF p_name IS NULL OR NOT (p_name = ANY (r.participants)) THEN
    RAISE EXCEPTION 'not_participant' USING ERRCODE = 'P0002';
  END IF;
  IF p_name = ANY (r.drawn) THEN
    RAISE EXCEPTION 'already_drawn' USING ERRCODE = 'P0001';
  END IF;

  -- People who still have to draw after this one.
  v_others := ARRAY(
    SELECT p FROM unnest(r.participants) p
    WHERE p <> p_name AND NOT (p = ANY (r.drawn))
  );

  IF cardinality(v_others) = 1 AND v_others[1] = ANY (r.pool) THEN
    v_pick := v_others[1];
  ELSE
    v_choices := ARRAY(SELECT p FROM unnest(r.pool) p WHERE p <> p_name);
    IF cardinality(v_choices) = 0 THEN
      RAISE EXCEPTION 'no_choice' USING ERRCODE = 'P0001';
    END IF;
    -- gen_random_uuid() is v4: 122 bits from a strong RNG.
    SELECT p INTO v_pick FROM unnest(v_choices) p ORDER BY gen_random_uuid() LIMIT 1;
  END IF;

  UPDATE secret_santa_rounds
  SET drawn = ARRAY(SELECT d FROM unnest(array_append(r.drawn, p_name)) d ORDER BY d),
      pool = array_remove(r.pool, v_pick)
  WHERE id = r.id;

  RETURN v_pick;
END;
$$;

-- Admin: start a new round with these names (replaces any old round).
CREATE OR REPLACE FUNCTION public.secret_santa_start(p_names text[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_names text[];
  v_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RAISE EXCEPTION 'not_allowed' USING ERRCODE = '42501';
  END IF;

  v_names := ARRAY(
    SELECT btrim(regexp_replace(n, '\s+', ' ', 'g'))
    FROM unnest(p_names) WITH ORDINALITY AS t(n, i)
    WHERE btrim(coalesce(n, '')) <> ''
    ORDER BY i
  );

  IF cardinality(v_names) < 3 OR cardinality(v_names) > 200 THEN
    RAISE EXCEPTION 'bad_count' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM unnest(v_names) n WHERE char_length(n) > 60) THEN
    RAISE EXCEPTION 'name_too_long' USING ERRCODE = '22023';
  END IF;
  IF (SELECT count(DISTINCT lower(n)) FROM unnest(v_names) n) <> cardinality(v_names) THEN
    RAISE EXCEPTION 'duplicate_name' USING ERRCODE = '22023';
  END IF;

  DELETE FROM secret_santa_rounds WHERE true;
  INSERT INTO secret_santa_rounds (participants, pool)
  VALUES (v_names, v_names)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Admin: throw the current round away.
CREATE OR REPLACE FUNCTION public.secret_santa_reset()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RAISE EXCEPTION 'not_allowed' USING ERRCODE = '42501';
  END IF;
  DELETE FROM secret_santa_rounds WHERE true;
END;
$$;

REVOKE ALL ON FUNCTION public.secret_santa_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.secret_santa_draw(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.secret_santa_start(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.secret_santa_reset() FROM PUBLIC;
-- Supabase's default privileges also grant EXECUTE to anon directly.
REVOKE EXECUTE ON FUNCTION public.secret_santa_start(text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.secret_santa_reset() FROM anon;
GRANT EXECUTE ON FUNCTION public.secret_santa_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.secret_santa_draw(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.secret_santa_start(text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.secret_santa_reset() TO authenticated;

COMMIT;
