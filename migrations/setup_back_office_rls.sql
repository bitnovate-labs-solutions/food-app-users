-- ============================================================================
-- SETUP ROW LEVEL SECURITY (RLS) POLICIES FOR BACK OFFICE TABLES
-- ============================================================================
-- This script enables RLS and creates policies for all back office tables
-- Run this in your Back Office Supabase SQL Editor (VITE_SECOND_SUPABASE_URL)
-- ============================================================================

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Public can view verified vendors (for restaurant listings)
CREATE POLICY "Public can view verified vendors"
ON vendors FOR SELECT
TO public
USING (verified_status = 'verified');

-- Authenticated users can view their own vendor record
CREATE POLICY "Users can view their own vendor record"
ON vendors FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Vendors can update their own vendor record
CREATE POLICY "Vendors can update their own record"
ON vendors FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Vendors can insert their own vendor record (for registration)
CREATE POLICY "Users can create their own vendor record"
ON vendors FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- RESTAURANTS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Public can view active restaurants
CREATE POLICY "Public can view active restaurants"
ON restaurants FOR SELECT
TO public
USING (status = 'active');

-- Authenticated users can view all restaurants (for browsing)
CREATE POLICY "Authenticated users can view restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (true);

-- Vendors can view their own restaurants
CREATE POLICY "Vendors can view their own restaurants"
ON restaurants FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = restaurants.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can insert restaurants for their vendor account
CREATE POLICY "Vendors can create restaurants"
ON restaurants FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = restaurants.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can update their own restaurants
CREATE POLICY "Vendors can update their own restaurants"
ON restaurants FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = restaurants.vendor_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = restaurants.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can delete their own restaurants
CREATE POLICY "Vendors can delete their own restaurants"
ON restaurants FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = restaurants.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- MENU CATEGORIES TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;

-- Public can view categories for active restaurants
CREATE POLICY "Public can view categories for active restaurants"
ON menu_categories FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = menu_categories.restaurant_id
    AND restaurants.status = 'active'
  )
);

-- Authenticated users can view all categories
CREATE POLICY "Authenticated users can view categories"
ON menu_categories FOR SELECT
TO authenticated
USING (true);

-- Vendors can manage categories for their restaurants
CREATE POLICY "Vendors can manage their restaurant categories"
ON menu_categories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = menu_categories.restaurant_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = menu_categories.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- MENU ITEMS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public can view available menu items for active restaurants
CREATE POLICY "Public can view available menu items"
ON menu_items FOR SELECT
TO public
USING (
  is_available = true AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = menu_items.restaurant_id
    AND restaurants.status = 'active'
  )
);

-- Authenticated users can view all menu items
CREATE POLICY "Authenticated users can view menu items"
ON menu_items FOR SELECT
TO authenticated
USING (true);

-- Vendors can manage menu items for their restaurants
CREATE POLICY "Vendors can manage their restaurant menu items"
ON menu_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = menu_items.restaurant_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = menu_items.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- REDEMPTION LOGS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE redemption_logs ENABLE ROW LEVEL SECURITY;

-- Vendors can view redemption logs for their restaurants
-- Note: This requires joining through transactions -> restaurants -> vendors
-- You may need to adjust based on your actual data relationships
CREATE POLICY "Vendors can view their redemption logs"
ON redemption_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = redemption_logs.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can insert redemption logs for their restaurants
CREATE POLICY "Vendors can create redemption logs"
ON redemption_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = redemption_logs.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can update redemption logs for their restaurants
CREATE POLICY "Vendors can update their redemption logs"
ON redemption_logs FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = redemption_logs.vendor_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = redemption_logs.vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- VOUCHERS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Public can view active vouchers (not expired)
CREATE POLICY "Public can view active vouchers"
ON vouchers FOR SELECT
TO public
USING (
  valid_until > now() AND
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = vouchers.restaurant_id
    AND restaurants.status = 'active'
  )
);

-- Authenticated users can view all vouchers
CREATE POLICY "Authenticated users can view vouchers"
ON vouchers FOR SELECT
TO authenticated
USING (true);

-- Vendors can manage vouchers for their restaurants
CREATE POLICY "Vendors can manage their restaurant vouchers"
ON vouchers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = vouchers.restaurant_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = vouchers.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Vendors can view transactions for their restaurants
CREATE POLICY "Vendors can view their restaurant transactions"
ON transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = transactions.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- Note: Transactions are typically created by the system/backend, not directly by users
-- You may want to restrict INSERT to service role or create a function for this
-- For now, we'll allow vendors to insert (you can restrict this further if needed)
CREATE POLICY "Vendors can create transactions for their restaurants"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = transactions.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can update transactions for their restaurants (for corrections)
CREATE POLICY "Vendors can update their restaurant transactions"
ON transactions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = transactions.restaurant_id
    AND vendors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    JOIN vendors ON vendors.id = restaurants.vendor_id
    WHERE restaurants.id = transactions.restaurant_id
    AND vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. All policies assume vendors are authenticated users with user_id = auth.uid()
-- 2. Public access is limited to active/verified content only
-- 3. Vendors can only manage content for their own restaurants
-- 4. You may need to adjust policies based on your specific business logic
-- 5. Consider adding admin roles if you need superuser access
-- 6. Transactions INSERT might need to be restricted to service role only
-- ============================================================================

