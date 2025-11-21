-- Add point and mascot configuration columns directly to restaurants table
-- This is simpler than having a separate restaurant_point_configs table

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS base_points integer DEFAULT 1 CHECK (base_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0 CHECK (bonus_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_enabled boolean DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS collection_set_id uuid; -- References collection_sets(id) in main DB

-- Add basic audit trail columns (who configured points, when)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS configured_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS configured_at timestamptz DEFAULT now();
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS last_modified_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS last_modified_at timestamptz DEFAULT now();

-- Index for collection_set_id lookups
CREATE INDEX IF NOT EXISTS idx_restaurants_collection_set ON restaurants(collection_set_id) WHERE collection_set_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN restaurants.base_points IS 'Base points awarded when QR code from this restaurant is scanned';
COMMENT ON COLUMN restaurants.bonus_points IS 'Additional bonus points (optional)';
COMMENT ON COLUMN restaurants.mascot_drop_rate IS 'Percentage chance (0-100) that a mascot will drop when scanning this restaurant''s QR code';
COMMENT ON COLUMN restaurants.collection_set_id IS 'Which collection set mascots can drop from (references collection_sets in main DB)';
COMMENT ON COLUMN restaurants.configured_by IS 'Admin who configured the point/mascot settings';
COMMENT ON COLUMN restaurants.configured_at IS 'When the point/mascot settings were first configured';
COMMENT ON COLUMN restaurants.last_modified_by IS 'Admin who last modified the point/mascot settings';
COMMENT ON COLUMN restaurants.last_modified_at IS 'When the point/mascot settings were last modified';

