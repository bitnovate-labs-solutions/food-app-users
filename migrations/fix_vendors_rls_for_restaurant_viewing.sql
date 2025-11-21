-- ============================================================================
-- FIX VENDORS RLS POLICY FOR RESTAURANT VIEWING
-- ============================================================================
-- This migration modifies the existing policy to allow users to view vendor
-- information when it's associated with an active restaurant
-- ============================================================================
-- Run this in your Back Office Supabase SQL Editor
-- ============================================================================
-- 
-- Problem: The policy "Vendors (+ admin) can view their own vendor account" 
-- only allows vendors to view their own account or admins to view any vendor.
-- Regular users viewing restaurant details cannot see vendor information.
--
-- Solution: Modify the existing SELECT policy to also allow viewing vendor
-- info when associated with an active restaurant.
-- ============================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Vendors (+ admin) can view their own vendor account" ON public.vendors;

-- Create updated policy that allows:
-- 1. Admins to view all vendors
-- 2. Vendors to view their own vendor account
-- 3. Anyone to view vendors associated with active restaurants (for restaurant detail pages)
CREATE POLICY "Vendors (+ admin) can view their own vendor account"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR id = public.get_user_vendor_id()
  OR EXISTS (
    -- Allow viewing vendor if it's associated with an active restaurant
    SELECT 1 
    FROM public.restaurants 
    WHERE restaurants.vendor_id = vendors.id 
    AND restaurants.status = 'active'
  )
);

-- Also add a policy for public (unauthenticated) users to view vendors
-- associated with active restaurants
DROP POLICY IF EXISTS "Public can view vendors for active restaurants" ON public.vendors;

CREATE POLICY "Public can view vendors for active restaurants"
ON public.vendors
FOR SELECT
TO public
USING (
  -- Public can view vendor if it's associated with an active restaurant
  EXISTS (
    SELECT 1 
    FROM public.restaurants 
    WHERE restaurants.vendor_id = vendors.id 
    AND restaurants.status = 'active'
  )
);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- The updated "Vendors (+ admin) can view their own vendor account" policy now allows:
-- 1. Admins to view any vendor (public.is_admin())
-- 2. Vendors to view their own vendor account (id = public.get_user_vendor_id())
-- 3. Any authenticated user to view vendor info for active restaurants
--
-- The public policy allows unauthenticated users to view vendor info for active restaurants.
--
-- This ensures that when users view restaurant details, they can see the
-- associated vendor information (business name, logo, contact info, etc.)

