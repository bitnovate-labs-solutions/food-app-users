-- Restaurant Mascots Table (Back Office Database)
-- Directly links restaurants to mascots that can drop when users scan QR codes
-- This allows vendors to see which mascots are assigned to their restaurants
-- and provides a direct relationship for QR code scanning

CREATE TABLE IF NOT EXISTS restaurant_mascots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL, -- References mascots(id) in main DB (cross-database reference)
  
  -- Assignment metadata
  assigned_by uuid REFERENCES profiles(id), -- Admin who assigned this mascot
  assigned_at timestamptz DEFAULT now(),
  
  -- Display order (for vendor UI)
  display_order integer DEFAULT 0,
  
  -- Prevent duplicate assignments (same mascot can't be assigned twice to same restaurant)
  UNIQUE(restaurant_id, mascot_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_restaurant ON restaurant_mascots(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_mascot ON restaurant_mascots(mascot_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_assigned_by ON restaurant_mascots(assigned_by) WHERE assigned_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_display_order ON restaurant_mascots(restaurant_id, display_order);

-- Comments
COMMENT ON TABLE restaurant_mascots IS 'Directly links restaurants to mascots that can drop when users scan QR codes. Vendors can see which mascots are assigned to their restaurants.';
COMMENT ON COLUMN restaurant_mascots.mascot_id IS 'Mascot that can drop from this restaurant (references mascots.id in main DB)';
COMMENT ON COLUMN restaurant_mascots.assigned_by IS 'Admin who assigned this mascot to the restaurant';
COMMENT ON COLUMN restaurant_mascots.display_order IS 'Order in which mascots are displayed in vendor UI';

