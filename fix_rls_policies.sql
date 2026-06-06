-- ============================================================
-- FIX: RLS Policies for DELETE operations
-- ============================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- 
-- PROBLEM: The anon key cannot DELETE from members or relationships
-- because no RLS policies exist for DELETE operations.
-- 
-- SOLUTION: Create policies allowing public DELETE on both tables.
-- ============================================================

-- 1. Allow public DELETE on members
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."members";
CREATE POLICY "Enable delete for all users" 
ON "public"."members"
FOR DELETE 
USING (true);

-- 2. Allow public DELETE on relationships
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."relationships";
CREATE POLICY "Enable delete for all users" 
ON "public"."relationships"
FOR DELETE 
USING (true);

-- 3. Make sure RLS is enabled (required for policies to work)
ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."relationships" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- If you also need to allow INSERT and UPDATE (for adding and
-- editing members), uncomment these policies too:
-- ============================================================

/*
-- Members: Allow INSERT for all
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."members";
CREATE POLICY "Enable insert for all users" 
ON "public"."members"
FOR INSERT 
WITH CHECK (true);

-- Members: Allow UPDATE for all
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."members";
CREATE POLICY "Enable update for all users" 
ON "public"."members"
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Relationships: Allow INSERT for all
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."relationships";
CREATE POLICY "Enable insert for all users" 
ON "public"."relationships"
FOR INSERT 
WITH CHECK (true);

-- Relationships: Allow UPDATE for all
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."relationships";
CREATE POLICY "Enable update for all users" 
ON "public"."relationships"
FOR UPDATE 
USING (true)
WITH CHECK (true);
*/