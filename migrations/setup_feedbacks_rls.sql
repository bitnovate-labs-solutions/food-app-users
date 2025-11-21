-- ============================================================================
-- SETUP ROW LEVEL SECURITY (RLS) FOR FEEDBACKS TABLE
-- ============================================================================
-- This script enables RLS and creates policies for the feedbacks table
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable RLS on feedbacks table
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Allow authenticated users to insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON feedbacks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to view their own feedback
CREATE POLICY "Users can view their own feedback"
ON feedbacks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: UPDATE and DELETE policies are intentionally omitted
-- Feedback submissions are typically immutable once submitted
-- If you need to allow updates/deletes, add policies like:
--
-- CREATE POLICY "Users can update their own feedback"
-- ON feedbacks FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
--
-- CREATE POLICY "Users can delete their own feedback"
-- ON feedbacks FOR DELETE
-- TO authenticated
-- USING (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATIC STORAGE CLEANUP TRIGGER
-- ============================================================================
-- This trigger automatically deletes associated storage files when a feedback
-- row is deleted

-- Function to extract file path from Supabase Storage URL
CREATE OR REPLACE FUNCTION extract_storage_path(url text)
RETURNS text AS $$
DECLARE
  path_part text;
BEGIN
  -- Extract path after '/feedback-images/'
  -- URL format: https://[project].supabase.co/storage/v1/object/public/feedback-images/[user-id]/[filename]?[query]
  IF url LIKE '%/feedback-images/%' THEN
    -- Extract everything after 'feedback-images/' and before '?' (if query params exist)
    path_part := substring(url from 'feedback-images/([^?]+)');
    RETURN path_part;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to delete storage files when feedback is deleted
CREATE OR REPLACE FUNCTION delete_feedback_storage_files()
RETURNS TRIGGER AS $$
DECLARE
  image_url text;
  file_path text;
BEGIN
  -- Loop through each image URL in the deleted row
  IF OLD.image_urls IS NOT NULL THEN
    FOREACH image_url IN ARRAY OLD.image_urls
    LOOP
      -- Extract file path from URL
      file_path := extract_storage_path(image_url);
      
      -- Delete from storage.objects if path was extracted
      IF file_path IS NOT NULL THEN
        DELETE FROM storage.objects
        WHERE bucket_id = 'feedback-images'
          AND name = file_path;
      END IF;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires before DELETE
CREATE TRIGGER delete_feedback_images_trigger
BEFORE DELETE ON feedbacks
FOR EACH ROW
EXECUTE FUNCTION delete_feedback_storage_files();

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. RLS is now enabled on the feedbacks table
-- 2. Users can only insert feedback with their own user_id
-- 3. Users can only view their own feedback submissions
-- 4. When a feedback row is deleted, associated storage files are automatically deleted
-- 5. The trigger uses SECURITY DEFINER to bypass RLS on storage.objects
-- 6. If you need admin access to view all feedback, add a separate policy:
--    CREATE POLICY "Admins can view all feedback"
--    ON feedbacks FOR SELECT
--    TO authenticated
--    USING (
--      EXISTS (
--        SELECT 1 FROM admin_users 
--        WHERE user_id = auth.uid()
--      )
--    );
-- ============================================================================

