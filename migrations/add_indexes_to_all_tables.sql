-- ============================================================================
-- ADD INDEXES TO ALL TABLES FOR PERFORMANCE
-- ============================================================================
-- This migration adds indexes to improve query performance
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PROFILES TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_vendor_id ON profiles(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================================================
-- APP_USERS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_app_users_profile_id ON app_users(profile_id);
CREATE INDEX IF NOT EXISTS idx_app_users_referred_by ON app_users(referred_by_profile_id) WHERE referred_by_profile_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);
CREATE INDEX IF NOT EXISTS idx_app_users_points_balance ON app_users(points_balance DESC) WHERE points_balance > 0;
CREATE INDEX IF NOT EXISTS idx_app_users_location ON app_users(current_latitude, current_longitude) WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_treasure_hunt ON app_users(active_treasure_hunt_id) WHERE active_treasure_hunt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_created_at ON app_users(created_at DESC);

-- ============================================================================
-- FEEDBACKS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_feedbacks_profile_id ON feedbacks(profile_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_source ON feedbacks(source) WHERE source IS NOT NULL;

-- ============================================================================
-- VENDORS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vendors_owner_profile_id ON vendors(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_verified_status ON vendors(verified_status);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);
-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_vendors_status_created ON vendors(verified_status, created_at DESC);

-- ============================================================================
-- RESTAURANTS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_vendor_id ON restaurants(vendor_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine_type ON restaurants(cuisine_type) WHERE cuisine_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_food_category ON restaurants(food_category);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_created_at ON restaurants(created_at DESC);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_restaurants_status_created ON restaurants(status, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_restaurants_vendor_status ON restaurants(vendor_id, status);

-- ============================================================================
-- MENU CATEGORIES TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant_id ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_sort_order ON menu_categories(restaurant_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_categories_created_at ON menu_categories(created_at DESC);

-- ============================================================================
-- MENU ITEMS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(restaurant_id, is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_menu_items_price ON menu_items(price);
CREATE INDEX IF NOT EXISTS idx_menu_items_average_rating ON menu_items(average_rating DESC) WHERE average_rating > 0;
CREATE INDEX IF NOT EXISTS idx_menu_items_created_at ON menu_items(created_at DESC);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available ON menu_items(restaurant_id, is_available, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_category ON menu_items(restaurant_id, category_id) WHERE category_id IS NOT NULL;

-- ============================================================================
-- VOUCHERS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_vouchers_restaurant_id ON vouchers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_vendor_id ON vouchers(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vouchers_valid_until ON vouchers(valid_until);
CREATE INDEX IF NOT EXISTS idx_vouchers_promo_code ON vouchers(promo_code);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers(created_at DESC);
-- Composite index for vouchers (filter by valid_until in queries, not in index predicate)
-- Note: Cannot use now() in index predicate as it's not immutable
CREATE INDEX IF NOT EXISTS idx_vouchers_restaurant_valid ON vouchers(restaurant_id, valid_until);

-- ============================================================================
-- TRANSACTIONS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_purchaser_profile_id ON transactions(purchaser_profile_id);
CREATE INDEX IF NOT EXISTS idx_transactions_purchase_id ON transactions(purchase_id);
CREATE INDEX IF NOT EXISTS idx_transactions_restaurant_id ON transactions(restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_purchased_at ON transactions(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_transactions_purchaser_date ON transactions(purchaser_profile_id, purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_date ON transactions(vendor_id, purchased_at DESC) WHERE vendor_id IS NOT NULL;

-- ============================================================================
-- REVIEWS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_helpful_count ON reviews(helpful_count DESC);
-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_active ON reviews(restaurant_id, status, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reviews_user_active ON reviews(user_id, status, created_at DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_active ON reviews(vendor_id, status, created_at DESC) WHERE vendor_id IS NOT NULL AND status = 'active';

-- ============================================================================
-- REDEMPTION LOGS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_redemption_logs_vendor_id ON redemption_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_purchase_item_id ON redemption_logs(purchase_item_id);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_status ON redemption_logs(redemption_status);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_created_at ON redemption_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemption_logs_completed_at ON redemption_logs(completed_at DESC) WHERE completed_at IS NOT NULL;
-- Composite index for vendor queries
CREATE INDEX IF NOT EXISTS idx_redemption_logs_vendor_status ON redemption_logs(vendor_id, redemption_status, created_at DESC);

-- ============================================================================
-- MASCOTS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_mascots_rarity ON mascots(rarity);
CREATE INDEX IF NOT EXISTS idx_mascots_created_at ON mascots(created_at DESC);

-- ============================================================================
-- COLLECTION SETS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_collection_sets_status ON collection_sets(status);
CREATE INDEX IF NOT EXISTS idx_collection_sets_availability ON collection_sets(availability_start, availability_end);
CREATE INDEX IF NOT EXISTS idx_collection_sets_created_at ON collection_sets(created_at DESC);
-- Composite index for active collections
CREATE INDEX IF NOT EXISTS idx_collection_sets_active ON collection_sets(status, availability_start, availability_end) WHERE status = 'active';

-- ============================================================================
-- COLLECTION SET MASCOTS TABLE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_collection_set_mascots_set_id ON collection_set_mascots(collection_set_id);
CREATE INDEX IF NOT EXISTS idx_collection_set_mascots_mascot_id ON collection_set_mascots(mascot_id);
-- The UNIQUE constraint already creates an index, but we add these for reverse lookups

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Indexes on foreign keys improve JOIN performance
-- 2. Indexes on status/state columns improve filtering
-- 3. Composite indexes support common query patterns
-- 4. Partial indexes (WHERE clause) reduce index size and improve performance
-- 5. DESC indexes support ORDER BY ... DESC queries
-- 6. Some indexes may already exist from UNIQUE constraints - IF NOT EXISTS prevents errors

