-- ============================================================================
-- TRUNCATE TABLES (in correct order to handle foreign key constraints)
-- ============================================================================
-- This script truncates all tables in the correct order
-- Child tables must be truncated before parent tables
-- ============================================================================

-- Option 1: Truncate all tables in one statement with CASCADE (Recommended)
TRUNCATE TABLE menu_images, menu_packages, restaurants, vendors CASCADE;

-- Option 2: If Option 1 doesn't work, truncate in order (child tables first)
-- Uncomment below if Option 1 doesn't work:
/*
TRUNCATE TABLE menu_images;
TRUNCATE TABLE menu_packages;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE vendors;
*/

-- ============================================================================
-- ALTERNATIVE: Delete all rows (if truncate doesn't work)
-- ============================================================================
-- DELETE FROM menu_images;
-- DELETE FROM menu_packages;
-- DELETE FROM restaurants;
-- DELETE FROM vendors;

-- ============================================================================
-- RESET SEQUENCES (if using auto-increment IDs)
-- ============================================================================
-- Note: UUIDs don't need sequence resets, but if you have serial/bigserial:
-- ALTER SEQUENCE vendors_id_seq RESTART WITH 1;
-- ALTER SEQUENCE restaurants_id_seq RESTART WITH 1;
-- ALTER SEQUENCE menu_packages_id_seq RESTART WITH 1;
-- ALTER SEQUENCE menu_images_id_seq RESTART WITH 1;

