-- ============================================================================
-- SETUP SUPABASE STORAGE FOR RESTAURANT IMAGES
-- ============================================================================
-- This script sets up the storage bucket and policies for restaurant cover images
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKET (via Supabase Dashboard)
-- ============================================================================
-- Note: SQL cannot create buckets directly, you must use the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard (for the BACK OFFICE Supabase instance)
-- 2. Click "New bucket"
-- 3. Name: "restaurant-images" (or "restaurant-covers")
-- 4. Public: Yes (if you want public access to restaurant images)
-- 5. File size limit: 10MB (or your preference - restaurant images may be larger)
-- 6. Allowed MIME types: image/*
-- 7. Click "Create bucket"

-- ============================================================================
-- STEP 2: STORAGE POLICIES (Run these after creating the bucket)
-- ============================================================================

-- Allow authenticated vendors to upload restaurant images
-- Note: This assumes vendors are authenticated users linked via vendors.user_id
CREATE POLICY "Vendors can upload restaurant images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-images' AND
  -- Allow if the user is a vendor (you may need to adjust this based on your auth setup)
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.user_id = auth.uid()
  )
);

-- Allow public to view restaurant images
CREATE POLICY "Public can view restaurant images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant-images');

-- Allow authenticated vendors to update their restaurant images
CREATE POLICY "Vendors can update their restaurant images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restaurant-images' AND
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.user_id = auth.uid()
  )
);

-- Allow authenticated vendors to delete their restaurant images
CREATE POLICY "Vendors can delete their restaurant images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-images' AND
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.user_id = auth.uid()
  )
);

-- ============================================================================
-- ALTERNATIVE: More restrictive policy (restrict to specific restaurant)
-- ============================================================================
-- If you want to restrict uploads to specific restaurant folders, you can use:
-- 
-- WITH CHECK (
--   bucket_id = 'restaurant-images' AND
--   (storage.foldername(name))[1] IN (
--     SELECT id::text FROM restaurants
--     WHERE vendor_id IN (
--       SELECT id FROM vendors WHERE user_id = auth.uid()
--     )
--   )
-- )
--
-- This would require organizing files as: restaurant-images/{restaurant_id}/filename.jpg

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The bucket must be created via Supabase Dashboard first
-- 2. Make sure the bucket is set to "Public" if you want public access
-- 3. The policies above allow vendors to manage restaurant images
-- 4. Adjust the vendor check based on your authentication setup
-- 5. Consider organizing files by restaurant_id for better access control
-- ============================================================================

