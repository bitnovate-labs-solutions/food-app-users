-- Create reviews table in the BACK OFFICE Supabase database
-- This table stores user reviews and ratings for restaurants
-- Note: user_id references auth.users in the MAIN database (separate database)
-- Since it's a separate database, we can't use foreign key constraints

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User reference (from main database, stored as UUID only)
  -- Note: No foreign key constraint since users are in a separate database
  user_id uuid NOT NULL,
  
  -- Restaurant reference (from back office database, same database)
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Review content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  
  -- Optional category ratings (for future use)
  -- These can be added later if needed
  -- cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  -- accuracy_rating integer CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
  -- value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Metadata for sorting and relevance
  helpful_count integer DEFAULT 0 CHECK (helpful_count >= 0),
  report_count integer DEFAULT 0 CHECK (report_count >= 0),
  
  -- Status management
  status text DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'flagged', 'hidden')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one review per user per restaurant
  UNIQUE (user_id, restaurant_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reviews_helpful_count ON reviews(helpful_count DESC);

-- Composite index for common queries (restaurant + active reviews)
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_active ON reviews(restaurant_id, status, created_at DESC) 
  WHERE status = 'active';

-- Composite index for user queries (user + active reviews)
CREATE INDEX IF NOT EXISTS idx_reviews_user_active ON reviews(user_id, status, created_at DESC) 
  WHERE status = 'active';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can view active reviews for active restaurants
CREATE POLICY "Public can view active reviews for active restaurants"
  ON reviews FOR SELECT
  TO public
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reviews.restaurant_id
      AND restaurants.status = 'active'
    )
  );

-- Authenticated users can view all active reviews
CREATE POLICY "Authenticated users can view active reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Users can create their own reviews for active restaurants
CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = reviews.restaurant_id
      AND restaurants.status = 'active'
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews (soft delete by setting status to 'deleted')
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'deleted');

-- Vendors can view reviews for their own restaurants
CREATE POLICY "Vendors can view reviews for their restaurants"
  ON reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      JOIN vendors ON restaurants.vendor_id = vendors.id
      WHERE restaurants.id = reviews.restaurant_id
      AND vendors.user_id = auth.uid()
    )
  );

-- Notes:
-- 1. This table is in the BACK OFFICE Supabase database
-- 2. restaurant_id has a foreign key constraint to restaurants table (same database)
-- 3. user_id is stored as UUID but has no foreign key constraint
--    since users are in the main database (separate Supabase project)
-- 4. Users can only create one review per restaurant (enforced by UNIQUE constraint)
-- 5. Reviews are soft-deleted (status = 'deleted') rather than hard-deleted
-- 6. RLS policies ensure:
--    - Users can only manage their own reviews
--    - Vendors can view reviews for their restaurants
--    - Public can only view active reviews for active restaurants
-- 7. Indexes are optimized for common queries:
--    - Finding reviews by restaurant (most common)
--    - Finding reviews by user
--    - Sorting by date, rating, helpfulness
--    - Filtering by status
-- 8. When fetching reviews, you'll need to:
--    - Join with restaurants (same database) for restaurant info
--    - Fetch user profile data from main database using user_id

