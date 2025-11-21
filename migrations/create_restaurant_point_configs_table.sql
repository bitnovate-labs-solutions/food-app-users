-- Restaurant Point Configuration Table (Back Office Database)
-- Admin-configurable point values and mascot drop rates per restaurant

CREATE TABLE IF NOT EXISTS restaurant_point_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  
  -- Point configuration
  base_points integer DEFAULT 1 CHECK (base_points >= 0),
  bonus_points integer DEFAULT 0 CHECK (bonus_points >= 0),
  
  -- Mascot configuration
  mascot_drop_enabled boolean DEFAULT false,
  mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100), -- Percentage (0-100)
  collection_set_id uuid, -- Which collection set mascots can drop from (references collection_sets in main DB)
  
  -- Configuration metadata
  configured_by uuid REFERENCES profiles(id), -- Admin who configured
  configured_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One configuration per restaurant
  UNIQUE(restaurant_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_point_configs_restaurant ON restaurant_point_configs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_point_configs_vendor ON restaurant_point_configs(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurant_point_configs_collection_set ON restaurant_point_configs(collection_set_id) WHERE collection_set_id IS NOT NULL;

-- Comments
COMMENT ON TABLE restaurant_point_configs IS 'Admin-configurable point values and mascot drop rates per restaurant';
COMMENT ON COLUMN restaurant_point_configs.base_points IS 'Base points awarded when QR code from this restaurant is scanned';
COMMENT ON COLUMN restaurant_point_configs.bonus_points IS 'Additional bonus points (optional)';
COMMENT ON COLUMN restaurant_point_configs.mascot_drop_rate IS 'Percentage chance (0-100) that a mascot will drop when scanning this restaurant''s QR code';

