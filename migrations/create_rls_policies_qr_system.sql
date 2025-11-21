-- =================================================================================
-- RLS POLICIES FOR QR CODE SCANNING & MASCOT COLLECTION SYSTEM
-- =================================================================================
-- Run this in MAIN database (where qr_code_scans and user_mascot_collections tables are)

-- =================================================================================
-- QR_CODE_SCANS TABLE
-- =================================================================================

-- Enable RLS
ALTER TABLE qr_code_scans ENABLE ROW LEVEL SECURITY;

-- Users can view their own scan history; vendors can view scans for their restaurants; admins can view all
CREATE POLICY "Users (+ vendors + admin) can view QR code scans"
ON public.qr_code_scans
FOR SELECT
TO authenticated
USING (
  -- Users can view their own scans (via app_users table)
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.id = qr_code_scans.app_user_id
    AND app_users.profile_id = auth.uid()
  )
  -- Vendors can view scans for their restaurants (for analytics/engagement tracking)
  OR (
    vendor_id IS NOT NULL
    AND vendor_id = public.get_user_vendor_id()
  )
  -- Admins can view all scans
  OR public.is_admin()
);

-- Users can create their own scan records (when scanning QR codes)
CREATE POLICY "Users can create their own QR code scans"
ON public.qr_code_scans
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.id = qr_code_scans.app_user_id
    AND app_users.profile_id = auth.uid()
  )
);

-- Admins can update/delete scan records (for corrections/debugging)
CREATE POLICY "Admins can update QR code scans"
ON public.qr_code_scans
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete QR code scans"
ON public.qr_code_scans
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =================================================================================
-- USER_MASCOT_COLLECTIONS TABLE
-- =================================================================================

-- Enable RLS
ALTER TABLE user_mascot_collections ENABLE ROW LEVEL SECURITY;

-- Users can view their own collections; admins can view all
-- Public might need to view collections for leaderboards/statistics (optional)
CREATE POLICY "Users (+ admin) can view their own mascot collections"
ON public.user_mascot_collections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.id = user_mascot_collections.app_user_id
    AND app_users.profile_id = auth.uid()
  )
  OR public.is_admin()
);

-- Optional: Allow public to view collections for leaderboards (uncomment if needed)
-- CREATE POLICY "Public can view mascot collections for leaderboards"
-- ON public.user_mascot_collections
-- FOR SELECT
-- TO anon, authenticated
-- USING (true); -- Public can view all collections for leaderboards/statistics

-- Users can create their own collection records (when collecting mascots)
CREATE POLICY "Users can create their own mascot collections"
ON public.user_mascot_collections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.id = user_mascot_collections.app_user_id
    AND app_users.profile_id = auth.uid()
  )
);

-- Admins can update/delete collection records (for corrections/debugging)
CREATE POLICY "Admins can update mascot collections"
ON public.user_mascot_collections
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete mascot collections"
ON public.user_mascot_collections
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =================================================================================
-- RESTAURANTS TABLE - NEW COLUMNS POLICIES
-- =================================================================================
-- Note: These columns are in the BACK OFFICE database
-- The existing restaurants RLS policies already cover these columns
-- But we should ensure admins can update the point/mascot configuration

-- The existing policies already cover updates:
-- "Vendors (+ admin) can update their own restaurants" policy will apply
-- However, we might want to restrict point/mascot config updates to admins only

-- Optional: Create a more restrictive policy for point/mascot configuration
-- This ensures only admins can change point values and mascot drop rates
-- (Uncomment if you want to restrict vendors from changing these settings)

-- CREATE POLICY "Only admins can update point and mascot configuration"
-- ON public.restaurants
-- FOR UPDATE
-- TO authenticated
-- USING (
--   public.is_admin()
--   OR vendor_id = public.get_user_vendor_id()
-- )
-- WITH CHECK (
--   -- If updating point/mascot config columns, only admin allowed
--   (
--     base_points IS NOT DISTINCT FROM (SELECT base_points FROM public.restaurants WHERE id = restaurants.id)
--     AND bonus_points IS NOT DISTINCT FROM (SELECT bonus_points FROM public.restaurants WHERE id = restaurants.id)
--     AND mascot_drop_enabled IS NOT DISTINCT FROM (SELECT mascot_drop_enabled FROM public.restaurants WHERE id = restaurants.id)
--     AND mascot_drop_rate IS NOT DISTINCT FROM (SELECT mascot_drop_rate FROM public.restaurants WHERE id = restaurants.id)
--     AND collection_set_id IS NOT DISTINCT FROM (SELECT collection_set_id FROM public.restaurants WHERE id = restaurants.id)
--   )
--   OR public.is_admin()
-- );

-- Note: The above policy is complex. A simpler approach is to handle this in application logic
-- and rely on the existing "Vendors (+ admin) can update their own restaurants" policy

-- =================================================================================
-- RESTAURANT MASCOTS TABLE (Back Office DB)
-- =================================================================================
-- Note: This table is in the BACK OFFICE database, not the main database
-- Run these policies in your BACK OFFICE database

-- Enable RLS
ALTER TABLE restaurant_mascots ENABLE ROW LEVEL SECURITY;

-- Public can view restaurant mascots (for displaying which mascots can drop)
CREATE POLICY "Public can view restaurant mascots"
ON public.restaurant_mascots
FOR SELECT
TO anon, authenticated
USING (true); -- Public can see which mascots are assigned to restaurants

-- Vendors can view mascots for their own restaurants
CREATE POLICY "Vendors can view mascots for their restaurants"
ON public.restaurant_mascots
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_mascots.restaurant_id
    AND restaurants.vendor_id = public.get_user_vendor_id()
  )
);

-- Admins can manage all restaurant mascots
CREATE POLICY "Admins can manage restaurant mascots"
ON public.restaurant_mascots
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

