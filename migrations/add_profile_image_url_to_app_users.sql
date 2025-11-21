-- Add profile_image_url column to app_users table
-- This stores the URL of the user's profile image directly in the app_users table

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Add comment
COMMENT ON COLUMN app_users.profile_image_url IS 'URL of the user profile image stored in Supabase Storage or external service';

