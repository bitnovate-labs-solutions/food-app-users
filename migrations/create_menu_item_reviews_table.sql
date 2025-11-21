-- Create menu_item_reviews table in the BACK OFFICE Supabase database
-- This table stores user reviews and ratings for individual menu items
-- Note: user_id references auth.users in the MAIN database (separate database)
-- Since it's a separate database, we can't use foreign key constraints

CREATE TABLE IF NOT EXISTS menu_item_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (from main database, stored as UUID only)
  -- Note: No foreign key constraint since users are in a separate database
  user_id uuid NOT NULL,
  
  -- Menu item reference (from back office database, same database)
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Review content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  
  -- Metadata for sorting and relevance
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  report_count integer DEFAULT 0 CHECK (report_count >= 0),
  
  -- Status management
  status text DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'flagged', 'hidden')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one review per user per menu item
  UNIQUE (user_id, menu_item_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_menu_item_id ON menu_item_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_user_id ON menu_item_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_rating ON menu_item_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_created_at ON menu_item_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_status ON menu_item_reviews(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_helpful_count ON menu_item_reviews(helpful_count DESC);

-- Composite index for common queries (menu item + active reviews)
CREATE INDEX IF NOT EXISTS idx_menu_item_reviews_item_active ON menu_item_reviews(menu_item_id, status, created_at DESC) 
  WHERE status = 'active';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_item_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_menu_item_reviews_updated_at
  BEFORE UPDATE ON menu_item_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_item_reviews_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE menu_item_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view active reviews for available menu items
CREATE POLICY "Public can view active reviews for available menu items"
  ON menu_item_reviews FOR SELECT
  TO public
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM menu_items
      WHERE menu_items.id = menu_item_reviews.menu_item_id
      AND menu_items.is_available = true
      AND EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = menu_items.restaurant_id
        AND restaurants.status = 'active'
      )
    )
  );

-- Authenticated users can view all active reviews
CREATE POLICY "Authenticated users can view active reviews"
  ON menu_item_reviews FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Users can create their own reviews for available menu items
CREATE POLICY "Users can create their own reviews"
  ON menu_item_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM menu_items
      WHERE menu_items.id = menu_item_reviews.menu_item_id
      AND menu_items.is_available = true
      AND EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = menu_items.restaurant_id
        AND restaurants.status = 'active'
      )
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON menu_item_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews (soft delete by setting status to 'deleted')
CREATE POLICY "Users can delete their own reviews"
  ON menu_item_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'deleted');

-- Notes:
-- 1. This table is in the BACK OFFICE Supabase database
-- 2. menu_item_id has a foreign key constraint to menu_items table (same database)
-- 3. user_id is stored as UUID but has no foreign key constraint
--    since users are in the main database (separate Supabase project)
-- 4. Users can only create one review per menu item (enforced by UNIQUE constraint)
-- 5. Reviews are soft-deleted (status = 'deleted') rather than hard-deleted
-- 6. RLS policies ensure:
--    - Users can only manage their own reviews
--    - Public can only view active reviews for available menu items from active restaurants
-- 7. Indexes are optimized for common queries:
--    - Finding reviews by menu item (most common)
--    - Finding reviews by user
--    - Sorting by date, rating, helpfulness
--    - Filtering by status
-- 8. When fetching menu item ratings, you'll need to:
--    - Calculate average rating: AVG(rating) WHERE menu_item_id = X AND status = 'active'
--    - Count reviews: COUNT(*) WHERE menu_item_id = X AND status = 'active'
--    - Or use a database view/function to compute these values

