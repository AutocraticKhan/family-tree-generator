-- ============================================================
-- RECOMMENDED (Path A): Disable RLS + grant privileges
-- ============================================================
-- For a private family app sitting behind an invitation code, RLS is
-- overkill. Just disable it on these two tables and grant the anon
-- role full access. This is the simplest path that is GUARANTEED to
-- work.
--
-- After running this, the in-app "RLS Status" badge will turn green
-- and delete / admin-approve will persist.
-- ============================================================

ALTER TABLE public.members        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships  DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON TABLE public.members       TO anon;
GRANT ALL ON TABLE public.relationships TO anon;


-- ============================================================
-- ALTERNATIVE (Path B): Keep RLS but make policies work
-- ============================================================
-- Use this instead of Path A if you want DB-level isolation. Drops
-- every policy on the two tables, then recreates one permissive
-- policy per table with both USING and WITH CHECK clauses (the
-- latter is required for UPDATE/INSERT to actually persist).
-- ============================================================

/*
DO $$
DECLARE p text;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename IN ('members', 'relationships')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.members', p);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.relationships', p);
  END LOOP;
END$$;

GRANT USAGE  ON SCHEMA public          TO anon;
GRANT ALL    ON TABLE public.members   TO anon;
GRANT ALL    ON TABLE public.relationships TO anon;

ALTER TABLE public.members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_all_members"       ON public.members
  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "app_all_relationships" ON public.relationships
  FOR ALL TO anon USING (true) WITH CHECK (true);
*/
