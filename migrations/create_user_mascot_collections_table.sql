-- User Mascot Collections Table (Main Database)
-- Tracks which mascots users have collected

CREATE TABLE IF NOT EXISTS user_mascot_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL REFERENCES mascots(id) ON DELETE CASCADE,
  collection_set_id uuid REFERENCES collection_sets(id),
  
  -- Collection metadata
  collected_at timestamptz DEFAULT now(),
  collected_from text CHECK (collected_from IN ('qr_scan', 'treasure_hunt', 'purchase', 'reward', 'admin_gift')),
  qr_code_hash text, -- If collected from QR scan
  restaurant_id uuid, -- If collected from restaurant QR (cross-database reference)
  
  -- Prevent duplicate collections (user can only collect same mascot once)
  UNIQUE(app_user_id, mascot_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_collections_app_user ON user_mascot_collections(app_user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_mascot ON user_mascot_collections(mascot_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_set ON user_mascot_collections(collection_set_id) WHERE collection_set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_collections_date ON user_mascot_collections(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_collections_source ON user_mascot_collections(collected_from);

-- Comments
COMMENT ON TABLE user_mascot_collections IS 'Tracks which mascots each user has collected';
COMMENT ON COLUMN user_mascot_collections.collected_from IS 'Source of the mascot collection (qr_scan, treasure_hunt, etc.)';
COMMENT ON COLUMN user_mascot_collections.qr_code_hash IS 'QR code hash if mascot was collected from scanning a QR code';

