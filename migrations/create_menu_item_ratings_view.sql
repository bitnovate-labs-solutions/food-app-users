-- Create a view to calculate aggregated ratings for menu items
-- This view provides quick access to average rating and review count
-- Run this in your BACK OFFICE Supabase database

CREATE OR REPLACE VIEW menu_item_ratings AS
SELECT 
  menu_item_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating)::numeric, 1) as average_rating,
  MIN(rating) as min_rating,
  MAX(rating) as max_rating
FROM menu_item_reviews
WHERE status = 'active'
GROUP BY menu_item_id;

-- Create an index on the view's underlying table for better performance
-- (The indexes on menu_item_reviews already cover this)

-- Usage example:
-- SELECT 
--   mi.*,
--   mir.review_count,
--   mir.average_rating
-- FROM menu_items mi
-- LEFT JOIN menu_item_ratings mir ON mir.menu_item_id = mi.id
-- WHERE mi.restaurant_id = '...';

