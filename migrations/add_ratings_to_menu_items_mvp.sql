-- MVP APPROACH: Add rating columns directly to menu_items table
-- This is simpler and faster for MVP, but less flexible than a separate table
-- Run this in your BACK OFFICE Supabase database

-- Add rating columns to menu_items table
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS average_rating numeric(3,1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0 CHECK (review_count >= 0);

-- Add index for filtering/sorting by rating
CREATE INDEX IF NOT EXISTS idx_menu_items_average_rating ON menu_items(average_rating DESC)
  WHERE average_rating > 0;

-- Notes:
-- 1. This is a SIMPLER approach for MVP
-- 2. You'll need to manually update these values when reviews are added/updated/deleted
-- 3. For MVP, you can update them via application code or simple SQL
-- 4. Later, you can migrate to menu_item_reviews table if needed (see migration guide)
-- 5. This approach is fine if you don't need to track individual reviews per menu item
-- 6. To migrate later: Run create_menu_item_reviews_table.sql, then migrate data, then drop these columns

