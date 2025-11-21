-- ============================================================================
-- SETUP SUPABASE STORAGE FOR USER AVATARS
-- ============================================================================
-- This script sets up the storage bucket and policies for user profile images
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE STORAGE BUCKET (via Supabase Dashboard)
-- ============================================================================
-- Note: SQL cannot create buckets directly, you must use the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "user-avatars"
-- 4. Public: Yes (if you want public access to profile images)
-- 5. File size limit: 5MB (or your preference)
-- 6. Allowed MIME types: image/*
-- 7. Click "Create bucket"

-- ============================================================================
-- STEP 2: STORAGE POLICIES (Run these after creating the bucket)
-- ============================================================================

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public to view user avatars
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. The bucket must be created via Supabase Dashboard first
-- 2. Make sure the bucket is set to "Public" if you want public access
-- 3. The policies above allow users to manage only their own images
-- 4. File names should include the user's auth.uid() for proper access control
-- ============================================================================

