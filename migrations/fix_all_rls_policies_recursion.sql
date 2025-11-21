-- ============================================================================
-- FIX INFINITE RECURSION IN ALL RLS POLICIES
-- ============================================================================
-- The issue: Policies query profiles table to check admin role/vendor_id,
-- which triggers the same policy again, causing infinite recursion.
-- Solution: Create security definer functions that bypass RLS
-- ============================================================================

-- ============================================================================
-- STEP 1: Create security definer helper functions
-- ============================================================================

-- Check if current user is admin
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

-- Get current user's role
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

-- Get current user's vendor_id
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
-- STEP 2: Fix PROFILES table policies
-- ============================================================================

DROP POLICY IF EXISTS "Users (+ admin) can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users (+ admin) can update their own profile" ON public.profiles;

CREATE POLICY "Users (+ admin) can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.is_admin()
);

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

-- ============================================================================
-- STEP 3: Fix APP_USERS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Users (+ admin) can view their own app profile" ON public.app_users;
DROP POLICY IF EXISTS "Users (+ admin) can update their own app profile" ON public.app_users;

CREATE POLICY "Users (+ admin) can view their own app profile"
ON public.app_users
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "Users (+ admin) can update their own app profile"
ON public.app_users
FOR UPDATE
TO authenticated
USING (
  profile_id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  profile_id = auth.uid()
  OR public.is_admin()
);

-- ============================================================================
-- STEP 4: Fix VENDORS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Vendors (+ admin) can view their own vendor account" ON public.vendors;
DROP POLICY IF EXISTS "Vendors (+ admin) can update their own vendor account" ON public.vendors;
DROP POLICY IF EXISTS "Admins can create vendors" ON public.vendors;

CREATE POLICY "Vendors (+ admin) can view their own vendor account"
ON public.vendors
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR id = public.get_user_vendor_id()
);

CREATE POLICY "Vendors (+ admin) can update their own vendor account"
ON public.vendors
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR id = public.get_user_vendor_id()
)
WITH CHECK (
  public.is_admin()
  OR id = public.get_user_vendor_id()
);

CREATE POLICY "Admins can create vendors"
ON public.vendors
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);

-- ============================================================================
-- STEP 5: Fix RESTAURANTS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors (+ admin) can view managed restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors (+ admin) can create restaurants for their own vendor account" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors (+ admin) can update their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Vendors (+ admin) can delete their own restaurants" ON public.restaurants;

CREATE POLICY "Public can view active restaurants"
ON public.restaurants
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
  OR public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

CREATE POLICY "Vendors (+ admin) can view managed restaurants"
ON public.restaurants
FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

CREATE POLICY "Vendors (+ admin) can create restaurants for their own vendor account"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() IN ('vendor','admin')
  AND (
    public.is_admin()
    OR vendor_id = public.get_user_vendor_id()
  )
);

CREATE POLICY "Vendors (+ admin) can update their own restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
)
WITH CHECK (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

CREATE POLICY "Vendors (+ admin) can delete their own restaurants"
ON public.restaurants
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

-- ============================================================================
-- STEP 6: Fix MENU_CATEGORIES table policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can view menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Vendors (+ admin) can create menu categories for their own restaurants" ON public.menu_categories;
DROP POLICY IF EXISTS "Vendors (+ admin) can update their own menu categories" ON public.menu_categories;
DROP POLICY IF EXISTS "Vendors (+ admin) can delete their own menu categories" ON public.menu_categories;

CREATE POLICY "Public can view menu categories"
ON public.menu_categories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Vendors (+ admin) can create menu categories for their own restaurants"
ON public.menu_categories
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() IN ('vendor','admin')
  AND EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND (
      public.is_admin()
      OR r.vendor_id = public.get_user_vendor_id()
    )
  )
);

CREATE POLICY "Vendors (+ admin) can update their own menu categories"
ON public.menu_categories
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
);

CREATE POLICY "Vendors (+ admin) can delete their own menu categories"
ON public.menu_categories
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
);

-- ============================================================================
-- STEP 7: Fix MENU_ITEMS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors (+ admin) can create menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors (+ admin) can update menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Vendors (+ admin) can delete menu items" ON public.menu_items;

CREATE POLICY "Public can view menu items"
ON public.menu_items
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Vendors (+ admin) can create menu items"
ON public.menu_items
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() IN ('vendor','admin')
  AND EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND (
      public.is_admin()
      OR r.vendor_id = public.get_user_vendor_id()
    )
  )
);

CREATE POLICY "Vendors (+ admin) can update menu items"
ON public.menu_items
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
);

CREATE POLICY "Vendors (+ admin) can delete menu items"
ON public.menu_items
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.restaurants r
    WHERE r.id = restaurant_id
    AND r.vendor_id = public.get_user_vendor_id()
  )
);

-- ============================================================================
-- STEP 8: Fix VOUCHERS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can view vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Vendors (+ admin) can create vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Vendors (+ admin) can update vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Vendors (+ admin) can delete vouchers" ON public.vouchers;

CREATE POLICY "Public can view vouchers"
ON public.vouchers
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Vendors (+ admin) can create vouchers"
ON public.vouchers
FOR INSERT
TO authenticated
WITH CHECK (
  public.get_user_role() IN ('vendor','admin')
  AND (
    public.is_admin()
    OR vendor_id = public.get_user_vendor_id()
  )
);

CREATE POLICY "Vendors (+ admin) can update vouchers"
ON public.vouchers
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
)
WITH CHECK (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

CREATE POLICY "Vendors (+ admin) can delete vouchers"
ON public.vouchers
FOR DELETE
TO authenticated
USING (
  public.is_admin()
  OR vendor_id = public.get_user_vendor_id()
);

-- ============================================================================
-- STEP 9: Fix TRANSACTIONS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own transactions; vendors can view their vendor transactions; admins can view all" ON public.transactions;
DROP POLICY IF EXISTS "Users (+ admin) can create their own transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions; vendors can view their vendor transactions; admins can view all"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  purchaser_profile_id = auth.uid()
  OR (
    vendor_id IS NOT NULL
    AND vendor_id = public.get_user_vendor_id()
  )
  OR public.is_admin()
);

CREATE POLICY "Users (+ admin) can create their own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  purchaser_profile_id = auth.uid()
  OR public.is_admin()
);

-- ============================================================================
-- STEP 10: Fix REVIEWS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Public can view active reviews" ON public.reviews;
DROP POLICY IF EXISTS "Vendors (+ admin) can view reviews for their restaurant" ON public.reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users (+ admin) can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users (+ admin) can delete their own reviews" ON public.reviews;

CREATE POLICY "Public can view active reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (status = 'active');

CREATE POLICY "Vendors (+ admin) can view reviews for their restaurant"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  public.get_user_role() = 'vendor'
  AND vendor_id = public.get_user_vendor_id()
);

CREATE POLICY "Users can create their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users (+ admin) can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_admin()
)
WITH CHECK (
  user_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "Users (+ admin) can delete their own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_admin()
);

-- ============================================================================
-- STEP 11: Fix REDEMPTION_LOGS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Vendors can view their own redemption logs; admins can view all" ON public.redemption_logs;

CREATE POLICY "Vendors can view their own redemption logs; admins can view all"
ON public.redemption_logs
FOR SELECT
TO authenticated
USING (
  vendor_id = public.get_user_vendor_id()
  OR public.is_admin()
);

-- ============================================================================
-- STEP 12: Fix FEEDBACKS table policies
-- ============================================================================

DROP POLICY IF EXISTS "Users (+ admin) can view their own feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can create their own feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins can update feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Admins can delete feedbacks" ON public.feedbacks;

CREATE POLICY "Users (+ admin) can view their own feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
  OR public.is_admin()
);

CREATE POLICY "Users can create their own feedback"
ON public.feedbacks
FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can update feedbacks"
ON public.feedbacks
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete feedbacks"
ON public.feedbacks
FOR DELETE
TO authenticated
USING (public.is_admin());

