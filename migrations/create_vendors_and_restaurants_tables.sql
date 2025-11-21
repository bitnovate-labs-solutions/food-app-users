-- Create vendors table first (without restaurant_id)
-- ============================================

CREATE TABLE vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  name text,
  email varchar(255) NOT NULL UNIQUE,
  phone varchar(100),
  business_logo_url text,
  website text,
  social_links jsonb,
  business_address text,
  city text,
  state text,
  country text,
  payment_details jsonb,
  verified_status text DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create restaurants table (can now reference vendors)
-- ============================================

CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  name text NOT NULL,
  location text,
  description text,
  address text,
  hours TEXT,  -- Operating hours of the restaurant
  phone_number TEXT,  -- Phone number of the restaurant
  image_url TEXT,  -- URL of the restaurant's image
  cuisine_type text CHECK (cuisine_type IN (
    'Chinese', 
    'Indian', 
    'Italian', 
    'Japanese', 
    'Mexican', 
    'American', 
    'Mamak',
    'Mediterranean', 
    'Middle Eastern', 
    'French', 
    'Thai', 
    'Vietnamese', 
    'Greek',    
    'Spanish',
    'Korean',
    'Turkish',      
    'Western',      
    'Other'
  )),
  food_category text DEFAULT 'All' CHECK (food_category IN ('All', 'Gluten-Free', 'Halal', 'Kosher', 'Non-Halal', 'Vegan', 'Vegetarian')),
  status text CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
-- ============================================

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_email ON vendors(email);
CREATE INDEX idx_vendors_verified_status ON vendors(verified_status);

CREATE INDEX idx_restaurants_vendor_id ON restaurants(vendor_id);
CREATE INDEX idx_restaurants_cuisine_type ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_food_category ON restaurants(food_category);
CREATE INDEX idx_restaurants_status ON restaurants(status);

