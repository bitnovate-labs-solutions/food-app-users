-- ============================================================================
-- Fix: Add INSERT policy for profiles table
-- ============================================================================
-- The profiles table currently only has SELECT and UPDATE policies,
-- but no INSERT policy. This causes RLS violations when users try to
-- create their profile record from the create-profile page.
-- ============================================================================

-- Drop existing INSERT policy if it exists (in case it was created differently)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users (+ admin) can create their own profile" ON public.profiles;

-- Create INSERT policy that allows users to create their own profile record
-- This policy ensures:
-- 1. Users can only insert records where id matches their auth.uid()
-- 2. Admins can insert any record
CREATE POLICY "Users (+ admin) can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  OR public.is_admin()
);

-- Grant necessary permissions (if not already granted)
GRANT INSERT ON public.profiles TO authenticated;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This policy allows authenticated users to insert profiles records
--    where id = auth.uid() (their own profile)
-- 2. Admins can insert any profile record
-- 3. This works with the create-profile page where users create their
--    profile record after signup
-- 4. The profile.id must equal auth.uid() (which is the auth.users.id)
--    as per the schema: profiles.id references auth.users(id)

