-- Create transactions table
-- ============================================

CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES menu_packages(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price >= 0),
  total_amount numeric GENERATED ALWAYS AS (price * quantity) STORED,
  purchaser_id uuid NOT NULL,
  purchased_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (purchase_id, package_id)
);

-- Alternative syntax using named constraint (if you prefer):
-- ============================================
-- CREATE TABLE transactions (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   purchase_id uuid NOT NULL,
--   package_id uuid NOT NULL,
--   quantity integer NOT NULL CHECK (quantity > 0),
--   price numeric NOT NULL CHECK (price >= 0),
--   total_amount numeric GENERATED ALWAYS AS (price * quantity) STORED,
--   purchaser_id uuid NOT NULL,
--   purchased_at timestamptz NOT NULL,
--   created_at timestamptz DEFAULT now(),
--   UNIQUE (purchase_id, package_id),
--   CONSTRAINT transactions_package_id_fkey 
--     FOREIGN KEY (package_id) 
--     REFERENCES menu_packages(id) 
--     ON DELETE CASCADE
-- );

-- Create indexes for performance
-- ============================================

CREATE INDEX idx_transactions_purchase_id ON transactions(purchase_id);
CREATE INDEX idx_transactions_package_id ON transactions(package_id);
CREATE INDEX idx_transactions_purchaser_id ON transactions(purchaser_id);
CREATE INDEX idx_transactions_purchased_at ON transactions(purchased_at);

