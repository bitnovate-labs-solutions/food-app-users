-- ============================================================================
-- Fix: Add INSERT policy for app_users table
-- ============================================================================
-- The app_users table currently only has SELECT and UPDATE policies,
-- but no INSERT policy. This causes RLS violations when users try to
-- create their app_users record from the create-profile page.
-- ============================================================================

-- Drop existing INSERT policy if it exists (in case it was created differently)
DROP POLICY IF EXISTS "Users can create their own app_users record" ON public.app_users;
DROP POLICY IF EXISTS "Users (+ admin) can create their own app profile" ON public.app_users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.app_users;

-- Create INSERT policy that allows users to create their own app_users record
-- This policy ensures:
-- 1. Users can only insert records where profile_id matches their auth.uid()
-- 2. Admins can insert any record
CREATE POLICY "Users (+ admin) can create their own app profile"
ON public.app_users
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id = auth.uid()
  OR public.is_admin()
);

-- Grant necessary permissions (if not already granted)
GRANT INSERT ON public.app_users TO authenticated;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This policy allows authenticated users to insert app_users records
--    where profile_id = auth.uid() (their own profile)
-- 2. Admins can insert any app_users record
-- 3. This works with the create-profile page where users create their
--    app_users record after signup
-- 4. The handle_new_user() trigger function uses SECURITY DEFINER, so it
--    bypasses RLS, but client-side inserts need this policy

