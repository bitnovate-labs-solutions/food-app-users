-- ============================================================================
-- FIX INFINITE RECURSION IN PROFILES RLS POLICIES
-- ============================================================================
-- The issue: Policies query profiles table to check admin role, which
-- triggers the same policy again, causing infinite recursion.
-- Solution: Create a security definer function that bypasses RLS to check role
-- ============================================================================

-- Create a security definer function to check if current user is admin
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Create a security definer function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Create a security definer function to get current user's vendor_id
CREATE OR REPLACE FUNCTION public.get_user_vendor_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT vendor_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- ============================================================================
-- DROP OLD POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "Users (+ admin) can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users (+ admin) can update their own profile" ON public.profiles;

-- ============================================================================
-- CREATE NEW POLICIES (using the security definer function)
-- ============================================================================

-- Users can view their own profile; admins can view all
CREATE POLICY "Users (+ admin) can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.is_admin()
);

-- Users can update only their own profile (display_name, phone, avatar, etc.)
CREATE POLICY "Users (+ admin) can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  id = auth.uid()
  OR public.is_admin()
);

