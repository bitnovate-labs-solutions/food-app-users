-- MIGRATION SCRIPT: Move from columns to separate table
-- Run this AFTER you've created menu_item_reviews table and want to migrate
-- This script helps migrate data from menu_items columns to menu_item_reviews table
-- Run this in your BACK OFFICE Supabase database

-- ============================================================================
-- STEP 1: Create menu_item_reviews table (if not already created)
-- ============================================================================
-- First, run: migrations/create_menu_item_reviews_table.sql

-- ============================================================================
-- STEP 2: Migrate existing rating data (if you have any)
-- ============================================================================
-- If you have existing ratings stored in menu_items columns, you can migrate them
-- This example assumes you have a way to identify which users gave which ratings
-- For MVP, you might not have this data, so this step may be skipped

-- Example migration (adjust based on your data):
-- INSERT INTO menu_item_reviews (user_id, menu_item_id, rating, review_text, status)
-- SELECT 
--   'anonymous-user-id'::uuid,  -- Replace with actual user_id if available
--   id,
--   average_rating::integer,
--   NULL,
--   'active'
-- FROM menu_items
-- WHERE average_rating > 0 AND review_count > 0;

-- ============================================================================
-- STEP 3: Create trigger to keep columns in sync (optional, for transition period)
-- ============================================================================
-- During migration, you can keep both systems in sync
-- This trigger updates menu_items columns when menu_item_reviews change

CREATE OR REPLACE FUNCTION update_menu_item_ratings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update average_rating and review_count in menu_items
  UPDATE menu_items
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM menu_item_reviews
      WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
      AND status = 'active'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM menu_item_reviews
      WHERE menu_item_id = COALESCE(NEW.menu_item_id, OLD.menu_item_id)
      AND status = 'active'
    )
  WHERE id = COALESCE(NEW.menu_item_id, OLD.menu_item_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_menu_item_ratings_on_insert
  AFTER INSERT ON menu_item_reviews
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION update_menu_item_ratings();

CREATE TRIGGER update_menu_item_ratings_on_update
  AFTER UPDATE ON menu_item_reviews
  FOR EACH ROW
  WHEN (NEW.status != OLD.status OR NEW.rating != OLD.rating)
  EXECUTE FUNCTION update_menu_item_ratings();

CREATE TRIGGER update_menu_item_ratings_on_delete
  AFTER DELETE ON menu_item_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_item_ratings();

-- ============================================================================
-- STEP 4: Update application code to use menu_item_reviews table
-- ============================================================================
-- Update your application to:
-- 1. Insert reviews into menu_item_reviews table
-- 2. Calculate ratings from menu_item_reviews (or use the view)
-- 3. The triggers above will keep menu_items columns in sync during transition

-- ============================================================================
-- STEP 5: Remove columns (ONLY after full migration and testing)
-- ============================================================================
-- Once you've fully migrated and tested, you can remove the columns:
-- 
-- DROP TRIGGER IF EXISTS update_menu_item_ratings_on_insert ON menu_item_reviews;
-- DROP TRIGGER IF EXISTS update_menu_item_ratings_on_update ON menu_item_reviews;
-- DROP TRIGGER IF EXISTS update_menu_item_ratings_on_delete ON menu_item_reviews;
-- DROP FUNCTION IF EXISTS update_menu_item_ratings();
-- 
-- ALTER TABLE menu_items
--   DROP COLUMN IF EXISTS average_rating,
--   DROP COLUMN IF EXISTS review_count;
-- 
-- DROP INDEX IF EXISTS idx_menu_items_average_rating;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This migration allows you to transition gradually
-- 2. Triggers keep both systems in sync during transition
-- 3. You can test the new system while old columns still work
-- 4. Remove columns only after full migration is complete
-- 5. The triggers ensure data consistency during the transition period
