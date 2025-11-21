-- ============================================================================
-- ENABLE SUPABASE REALTIME FOR TABLES
-- ============================================================================
-- This migration enables Realtime subscriptions for tables that need live updates
-- Run this in your Supabase SQL Editor
-- ============================================================================
-- 
-- Realtime allows clients to subscribe to database changes and receive
-- updates instantly without polling. This improves user experience and
-- reduces server load.
-- ============================================================================

-- ============================================================================
-- CRITICAL: RESTAURANT & MENU DATA (User-facing, changes frequently)
-- ============================================================================

-- Restaurants: Users need to see new restaurants and status changes immediately
ALTER PUBLICATION supabase_realtime ADD TABLE restaurants;

-- Menu Items: Users need to see new menu items when vendors add them
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- Menu Categories: Changes affect menu display
ALTER PUBLICATION supabase_realtime ADD TABLE menu_categories;

-- Vendors: Vendor info changes (verification status, business details)
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;

-- Vouchers: New vouchers and expiration updates
ALTER PUBLICATION supabase_realtime ADD TABLE vouchers;

-- ============================================================================
-- REVIEWS & RATINGS (User-generated content, needs live updates)
-- ============================================================================

-- Reviews: Users want to see new reviews immediately
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- ============================================================================
-- USER INTERACTIONS (Real-time features)
-- ============================================================================

-- Transactions: Users may want to see purchase confirmations in real-time
-- (Optional - only if you have real-time purchase notifications)
-- ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Redemption Logs: Vendors may want to see redemptions in real-time
-- (Optional - only if vendors have a real-time dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE redemption_logs;

-- ============================================================================
-- GAMIFICATION (If you have real-time leaderboards or live updates)
-- ============================================================================

-- Mascots: Only if mascots are added/updated frequently
-- ALTER PUBLICATION supabase_realtime ADD TABLE mascots;

-- Collection Sets: Only if collection sets change frequently
-- ALTER PUBLICATION supabase_realtime ADD TABLE collection_sets;

-- Collection Set Mascots: Only if relationships change frequently
-- ALTER PUBLICATION supabase_realtime ADD TABLE collection_set_mascots;

-- ============================================================================
-- USER DATA (Generally NOT recommended for Realtime)
-- ============================================================================
-- These tables contain sensitive user data and change infrequently.
-- Realtime is not recommended for:
-- - profiles (user identity - changes rarely)
-- - app_users (user profile data - changes infrequently)
-- - feedbacks (one-time submissions - no need for real-time)

-- ============================================================================
-- TO DISABLE REALTIME (if needed)
-- ============================================================================
-- To remove a table from Realtime:
-- ALTER PUBLICATION supabase_realtime DROP TABLE table_name;

-- ============================================================================
-- VERIFY REALTIME IS ENABLED
-- ============================================================================
-- Check which tables have Realtime enabled:
-- SELECT schemaname, tablename 
-- FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime';

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Realtime uses WebSocket connections - each subscription uses resources
-- 2. Only enable Realtime for tables that need live updates
-- 3. Consider the frequency of changes - if data rarely changes, polling may be better
-- 4. Realtime requires proper RLS policies - users can only subscribe to data they can read
-- 5. Monitor your Supabase usage - too many Realtime subscriptions can impact performance

