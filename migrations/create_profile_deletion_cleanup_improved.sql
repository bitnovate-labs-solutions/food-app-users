-- ============================================================================
-- OPTION 1: DIRECT STORAGE DELETION (RECOMMENDED)
-- ============================================================================
-- This approach deletes storage files directly from the database
-- Similar to how feedback images are handled (see setup_feedbacks_rls.sql)
-- Pros: Simple, fast, no HTTP calls, no external dependencies
-- Cons: Requires SECURITY DEFINER to bypass RLS on storage.objects

-- ============================================================================
-- PART A: Handle HARD DELETE (when profile row is actually deleted)
-- ============================================================================
-- Function to delete all storage files for a profile when profile is deleted
CREATE OR REPLACE FUNCTION handle_profile_hard_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all files from user-avatars bucket for this profile
  DELETE FROM storage.objects
  WHERE bucket_id = 'user-avatars'
    AND name LIKE OLD.id::text || '/%';

  -- Delete all files from feedback-images bucket for this profile
  DELETE FROM storage.objects
  WHERE bucket_id = 'feedback-images'
    AND name LIKE OLD.id::text || '/%';

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the deletion
    RAISE WARNING 'Error deleting storage files for profile %: %', OLD.id, SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for hard deletes (when profile row is actually deleted)
DROP TRIGGER IF EXISTS on_profile_hard_deleted ON public.profiles;
CREATE TRIGGER on_profile_hard_deleted
BEFORE DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION handle_profile_hard_deleted();

-- ============================================================================
-- PART B: Handle SOFT DELETE (when app_users.status changes to 'deleted')
-- ============================================================================
-- Function to delete storage files when app_users is soft-deleted
-- This handles the current app behavior where profiles are marked as deleted
CREATE OR REPLACE FUNCTION handle_app_user_soft_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only clean up storage when status changes TO 'deleted'
  IF NEW.status = 'deleted' AND (OLD.status IS NULL OR OLD.status != 'deleted') THEN
    -- Delete all files from user-avatars bucket for this profile
    DELETE FROM storage.objects
    WHERE bucket_id = 'user-avatars'
      AND name LIKE NEW.profile_id::text || '/%';

    -- Delete all files from feedback-images bucket for this profile
    DELETE FROM storage.objects
    WHERE bucket_id = 'feedback-images'
      AND name LIKE NEW.profile_id::text || '/%';

    RAISE NOTICE 'Storage files deleted for soft-deleted profile %', NEW.profile_id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the update
    RAISE WARNING 'Error deleting storage files for soft-deleted profile %: %', NEW.profile_id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for soft deletes (when app_users.status changes to 'deleted')
DROP TRIGGER IF EXISTS on_app_user_soft_deleted ON public.app_users;
CREATE TRIGGER on_app_user_soft_deleted
AFTER UPDATE OF status ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION handle_app_user_soft_deleted();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_profile_hard_deleted() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_app_user_soft_deleted() TO authenticated;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This handles BOTH soft deletes (current app behavior) and hard deletes
-- 2. Soft delete trigger fires when app_users.status changes to 'deleted'
-- 3. Hard delete trigger fires when profiles row is actually deleted
-- 4. Functions use SECURITY DEFINER to bypass RLS on storage.objects
-- 5. Files are deleted using pattern matching: profile_id/file_name
-- 6. This matches your storage path format: {bucket}/{profile_id}/{file}
-- 7. If deletion fails, it logs a warning but doesn't prevent the operation
-- 8. No external dependencies (no pg_net, no Edge Functions needed)
-- 9. Works immediately with your current DeleteAccountDrawer implementation

