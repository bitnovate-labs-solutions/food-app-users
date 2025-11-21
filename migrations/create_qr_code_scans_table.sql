-- QR Code Scans Table (Main Database)
-- Tracks all QR code scans to prevent duplicates and analyze usage
-- Simplified: Uses restaurant_id instead of qr_code_hash (QR codes generated on-the-fly)

CREATE TABLE IF NOT EXISTS qr_code_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL, -- References restaurants(id) in back office DB (cross-database reference)
  vendor_id uuid, -- References vendors(id) in back office DB - denormalized for RLS/analytics
  
  -- Scan result
  points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
  mascot_dropped boolean DEFAULT false,
  mascot_id uuid, -- If mascot was dropped (references mascots.id in main DB)
  
  -- Metadata
  scanned_at timestamptz DEFAULT now(),
  scan_date date DEFAULT CURRENT_DATE, -- For daily limit enforcement (users can scan once per day)
  
  -- Prevent duplicate scans per day (same user cannot scan same restaurant twice in one day)
  UNIQUE(app_user_id, restaurant_id, scan_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qr_scans_app_user ON qr_code_scans(app_user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_restaurant ON qr_code_scans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_vendor ON qr_code_scans(vendor_id) WHERE vendor_id IS NOT NULL; -- For vendor analytics
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_code_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scan_date ON qr_code_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_daily ON qr_code_scans(app_user_id, restaurant_id, scan_date); -- For daily limit enforcement
CREATE INDEX IF NOT EXISTS idx_qr_scans_mascot ON qr_code_scans(mascot_id) WHERE mascot_id IS NOT NULL;

-- Comments
COMMENT ON TABLE qr_code_scans IS 'Tracks all QR code scans to prevent duplicates and analyze usage patterns. Users can scan each restaurant once per day. Used for analytics, business intelligence, and engagement tracking.';
COMMENT ON COLUMN qr_code_scans.restaurant_id IS 'Restaurant whose QR code was scanned (references restaurants.id in back office DB)';
COMMENT ON COLUMN qr_code_scans.vendor_id IS 'Vendor who owns the restaurant (denormalized for RLS and analytics - references vendors.id in back office DB)';
COMMENT ON COLUMN qr_code_scans.scan_date IS 'Date of scan (YYYY-MM-DD) - used to enforce daily scan limit';
COMMENT ON COLUMN qr_code_scans.mascot_dropped IS 'Whether a mascot was dropped during this scan';

