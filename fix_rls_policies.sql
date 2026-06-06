-- ============================================================
-- FIX: RLS Policies for the Family Tree app
-- ============================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
--
-- PROBLEM
--   The anon key is the only credential used by the front-end. By
--   default, Supabase Row Level Security (RLS) DENIES every operation
--   to anon when no policy matches. That means:
--     * deleting a member is silently no-op'd (member disappears from
--       the UI but reappears on refresh because the row is still in
--       the database)
--     * admin "Approve" / "Reject" is silently no-op'd (the
--       `approved` flag never flips in the database, so the member
--       stays "Pending" forever)
--
-- SOLUTION
--   Add permissive policies for SELECT, INSERT, UPDATE, DELETE on
--   both `members` and `relationships`, and grant the `anon` role
--   the table privileges it needs. After running this script, the
--   delete button and the admin approval button will both persist.
--
-- NOTE
--   This is a public/anon-key project (no real authentication), so
--   the policies are wide open. If you ever add Supabase Auth, you
--   should tighten these policies to require `auth.role() = 'admin'`
--   for INSERT / UPDATE / DELETE.
-- ============================================================

-- 1. Make sure RLS is enabled (required for policies to be enforced).
ALTER TABLE "public"."members"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."relationships"  ENABLE ROW LEVEL SECURITY;

-- 2. Make sure the `anon` role can use the tables at all.
GRANT USAGE ON SCHEMA "public" TO anon;
GRANT ALL PRIVILEGES ON TABLE "public"."members"       TO anon;
GRANT ALL PRIVILEGES ON TABLE "public"."relationships" TO anon;

-- ============================================================
-- MEMBERS
-- ============================================================

-- 3a. Allow SELECT
DROP POLICY IF EXISTS "Enable read for all users"   ON "public"."members";
CREATE POLICY "Enable read for all users"
ON "public"."members"
FOR SELECT
USING (true);

-- 3b. Allow INSERT
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."members";
CREATE POLICY "Enable insert for all users"
ON "public"."members"
FOR INSERT
WITH CHECK (true);

-- 3c. Allow UPDATE (needed for admin "Approve" and for editing details)
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."members";
CREATE POLICY "Enable update for all users"
ON "public"."members"
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3d. Allow DELETE
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."members";
CREATE POLICY "Enable delete for all users"
ON "public"."members"
FOR DELETE
USING (true);

-- ============================================================
-- RELATIONSHIPS
-- ============================================================

-- 4a. Allow SELECT
DROP POLICY IF EXISTS "Enable read for all users"   ON "public"."relationships";
CREATE POLICY "Enable read for all users"
ON "public"."relationships"
FOR SELECT
USING (true);

-- 4b. Allow INSERT
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."relationships";
CREATE POLICY "Enable insert for all users"
ON "public"."relationships"
FOR INSERT
WITH CHECK (true);

-- 4c. Allow UPDATE (needed for admin to approve/reject links)
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."relationships";
CREATE POLICY "Enable update for all users"
ON "public"."relationships"
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 4d. Allow DELETE
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."relationships";
CREATE POLICY "Enable delete for all users"
ON "public"."relationships"
FOR DELETE
USING (true);

-- ============================================================
-- 5. Verification queries (optional — run these to confirm).
-- ============================================================
-- SELECT schemaname, tablename, policyname, cmd
--   FROM pg_policies
--  WHERE schemaname = 'public'
--  ORDER BY tablename, cmd;
-- ============================================================
