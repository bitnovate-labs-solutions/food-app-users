-- ============================================================================
-- SETUP SUPABASE STORAGE FOR MENU IMAGES
-- ============================================================================
-- This script sets up the storage bucket and policies for menu images
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Create storage bucket for menu images
-- Note: This needs to be done via Supabase Dashboard or Storage API
-- SQL cannot create buckets directly, but you can use the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "menu-images"
-- 4. Public: Yes (if you want public access)
-- 5. File size limit: 5MB (or your preference)
-- 6. Allowed MIME types: image/*

-- ============================================================================
-- STORAGE POLICIES (Run these after creating the bucket)
-- ============================================================================

-- Allow authenticated users to upload menu images
CREATE POLICY "Users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view menu images
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Allow authenticated users to update their own menu images
CREATE POLICY "Users can update their menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own menu images
CREATE POLICY "Users can delete their menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- ALTERNATIVE: If you want service role to manage all menu images
-- ============================================================================
-- Uncomment below if you want only service role (backend) to manage images:

-- DROP POLICY IF EXISTS "Users can upload menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their menu images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their menu images" ON storage.objects;

-- CREATE POLICY "Service role can manage menu images"
-- ON storage.objects FOR ALL
-- TO service_role
-- USING (bucket_id = 'menu-images');

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The menu_images table stores URLs (not files)
-- 2. Images are stored in Supabase Storage bucket "menu-images"
-- 3. The image_url column stores the public URL from Supabase Storage
-- 4. You can also store external URLs (from other services) in the same table
-- 5. The table is necessary to:
--    - Link images to menu packages
--    - Store metadata (created_at, updated_at)
--    - Support multiple images per package
--    - Track which images belong to which packages
-- ============================================================================

