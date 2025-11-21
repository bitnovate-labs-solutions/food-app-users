# QR Code Scanning & Mascot Collection - Implementation Guide

## 📋 Overview

This is the **final, recommended implementation** that balances simplicity with scalability.

**Key Features:**
- ✅ One QR code per restaurant (generated on-the-fly)
- ✅ Users can scan each restaurant **once per day**
- ✅ Admin-configurable points and mascot drop rates
- ✅ Basic audit trail (who configured what, when)
- ✅ Collection progress tracking

---

## 🗄️ Database Schema

### Step 1: Add Columns to Restaurants Table (Back Office DB)

**File**: `migrations/add_point_config_to_restaurants.sql`

```sql
-- Add point and mascot configuration columns directly to restaurants table
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
```

**Run this migration in your BACK OFFICE database.**

### Step 1b: Create Restaurant Mascots Table (Back Office DB)

**File**: `migrations/create_restaurant_mascots_table.sql`

```sql
-- Restaurant Mascots Table (Back Office Database)
-- Directly links restaurants to mascots that can drop when users scan QR codes
-- This allows vendors to see which mascots are assigned to their restaurants

CREATE TABLE IF NOT EXISTS restaurant_mascots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL, -- References mascots(id) in main DB (cross-database reference)
  
  -- Assignment metadata
  assigned_by uuid REFERENCES profiles(id), -- Admin who assigned this mascot
  assigned_at timestamptz DEFAULT now(),
  
  -- Display order (for vendor UI)
  display_order integer DEFAULT 0,
  
  -- Prevent duplicate assignments
  UNIQUE(restaurant_id, mascot_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_restaurant ON restaurant_mascots(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_mascot ON restaurant_mascots(mascot_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_mascots_display_order ON restaurant_mascots(restaurant_id, display_order);
```

**Run this migration in your BACK OFFICE database.**

**Note**: This table provides a direct relationship between restaurants and mascots. When scanning QR codes, the system will:
1. First check `restaurant_mascots` for directly assigned mascots
2. Fall back to `collection_set_mascots` if no direct assignments exist (using `restaurant.collection_set_id`)

This allows admins to either:
- Assign specific mascots directly to restaurants (via `restaurant_mascots`)
- Assign mascots via collection sets (via `restaurant.collection_set_id` → `collection_set_mascots`)

### Step 2: Create QR Code Scans Table (Main DB)

**File**: `migrations/create_qr_code_scans_table.sql`

```sql
-- QR Code Scans Table (Main Database)
-- Tracks all QR code scans to prevent duplicates and analyze usage
-- Users can scan each restaurant once per day

CREATE TABLE IF NOT EXISTS qr_code_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL, -- References restaurants(id) in back office DB
  
  -- Scan result
  points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
  mascot_dropped boolean DEFAULT false,
  mascot_id uuid REFERENCES mascots(id), -- If mascot was dropped
  
  -- Metadata
  scanned_at timestamptz DEFAULT now(),
  scan_date date DEFAULT CURRENT_DATE, -- For daily limit enforcement
  
  -- Prevent duplicate scans per day (same user cannot scan same restaurant twice in one day)
  UNIQUE(app_user_id, restaurant_id, scan_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qr_scans_app_user ON qr_code_scans(app_user_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_restaurant ON qr_code_scans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_code_scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scan_date ON qr_code_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_daily ON qr_code_scans(app_user_id, restaurant_id, scan_date);
CREATE INDEX IF NOT EXISTS idx_qr_scans_mascot ON qr_code_scans(mascot_id) WHERE mascot_id IS NOT NULL;
```

**Run this migration in your MAIN database.**

### Step 3: Create User Mascot Collections Table (Main DB)

**File**: `migrations/create_user_mascot_collections_table.sql`

```sql
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
  restaurant_id uuid, -- If collected from QR scan
  
  -- Prevent duplicate collections (user can only collect same mascot once)
  UNIQUE(app_user_id, mascot_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_collections_app_user ON user_mascot_collections(app_user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_mascot ON user_mascot_collections(mascot_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_set ON user_mascot_collections(collection_set_id) WHERE collection_set_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_collections_date ON user_mascot_collections(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_collections_source ON user_mascot_collections(collected_from);
```

**Run this migration in your MAIN database.**

---

## 🔐 QR Code Generation

### Simple Approach: Generate On-the-Fly

QR codes are generated using a hash of `restaurant_id` + secret key. No database storage needed.

```javascript
// Server-side function
function generateQRCodeData(restaurantId) {
  const secretKey = process.env.QR_CODE_SECRET_KEY; // Server-side secret
  const hash = crypto.createHash('sha256')
    .update(`${restaurantId}-${secretKey}`)
    .digest('hex')
    .substring(0, 16); // Use first 16 chars as hash
  
  return {
    type: 'restaurant_qr',
    restaurant_id: restaurantId,
    hash: hash,
    timestamp: Date.now()
  };
}

// Generate QR code image (using qrcode library)
async function generateQRCodeImage(restaurantId) {
  const qrData = generateQRCodeData(restaurantId);
  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
  return qrCodeImage; // Base64 image or upload to storage
}
```

**Vendors can generate QR codes** by calling an API endpoint that returns the QR code image.

---

## 📱 QR Code Scanning Logic

### Scan Processing Function

```javascript
async function processQRCodeScan(qrData, appUserId) {
  const { restaurant_id } = qrData;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 1. Get restaurant config (from restaurants table)
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, name, status, vendor_id, base_points, bonus_points, mascot_drop_enabled, mascot_drop_rate, collection_set_id')
    .eq('id', restaurant_id)
    .single();
  
  if (!restaurant || restaurant.status !== 'active') {
    throw new Error('Restaurant not found or inactive');
  }
  
  // 2. Check if already scanned TODAY
  const { data: existingScan } = await supabase
    .from('qr_code_scans')
    .select('id')
    .eq('app_user_id', appUserId)
    .eq('restaurant_id', restaurant_id)
    .eq('scan_date', today)
    .single();
  
  if (existingScan) {
    throw new Error('You have already scanned this restaurant today. Come back tomorrow!');
  }
  
  // 3. Calculate points
  const pointsEarned = (restaurant.base_points || 1) + (restaurant.bonus_points || 0);
  
  // 4. Determine mascot drop
  let mascot = null;
  let isNewMascot = false;
  
  if (restaurant.mascot_drop_enabled) {
    const dropRate = restaurant.mascot_drop_rate || 0;
    if (Math.random() * 100 <= dropRate) {
      // Select random mascot from restaurant's assigned mascots
      // First try restaurant_mascots table (direct assignment)
      const { data: restaurantMascots } = await supabase
        .from('restaurant_mascots')
        .select('mascot_id, mascots(*)')
        .eq('restaurant_id', restaurant_id);
      
      let availableMascots = [];
      
      if (restaurantMascots && restaurantMascots.length > 0) {
        // Use directly assigned mascots
        availableMascots = restaurantMascots
          .map(rm => rm.mascots)
          .filter(Boolean);
      } else if (restaurant.collection_set_id) {
        // Fallback to collection set mascots if no direct assignments
        const { data: setMascots } = await supabase
          .from('collection_set_mascots')
          .select('mascot_id, mascots(*)')
          .eq('collection_set_id', restaurant.collection_set_id);
        
        if (setMascots && setMascots.length > 0) {
          availableMascots = setMascots
            .map(sm => sm.mascots)
            .filter(Boolean);
        }
      }
      
      if (availableMascots.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMascots.length);
        mascot = availableMascots[randomIndex];
        
        if (mascot) {
          // Check if user already has this mascot
          const { data: existing } = await supabase
            .from('user_mascot_collections')
            .select('id')
            .eq('app_user_id', appUserId)
            .eq('mascot_id', mascot.id)
            .single();
          
          isNewMascot = !existing;
          
          // Add to collection if new
          if (isNewMascot) {
            await supabase.from('user_mascot_collections').insert({
              app_user_id: appUserId,
              mascot_id: mascot.id,
              collection_set_id: restaurant.collection_set_id,
              collected_from: 'qr_scan',
              restaurant_id: restaurant_id
            });
          }
        }
      }
    }
  }
  
  // 5. Update user points
  const { data: appUser } = await supabase
    .from('app_users')
    .select('points_balance, total_points_earned')
    .eq('id', appUserId)
    .single();
  
  await supabase
    .from('app_users')
    .update({
      points_balance: (appUser.points_balance || 0) + pointsEarned,
      total_points_earned: (appUser.total_points_earned || 0) + pointsEarned,
      updated_at: new Date().toISOString()
    })
    .eq('id', appUserId);
  
  // 6. Record scan (with today's date and vendor_id for analytics/RLS)
  await supabase.from('qr_code_scans').insert({
    app_user_id: appUserId,
    restaurant_id: restaurant_id,
    vendor_id: restaurant.vendor_id,
    points_earned: pointsEarned,
    mascot_dropped: !!mascot,
    mascot_id: mascot?.id,
    scan_date: today
  });
  
  // 7. Get collection progress
  const progress = await getCollectionProgress(appUserId, restaurant.collection_set_id);
  
  return {
    success: true,
    points_earned: pointsEarned,
    mascot: mascot,
    is_new_mascot: isNewMascot,
    collection_progress: progress,
    is_collection_complete: progress.current === progress.total
  };
}

// Helper: Get collection progress
async function getCollectionProgress(appUserId, collectionSetId) {
  if (!collectionSetId) {
    return { current: 0, total: 0, collection_set_id: null };
  }
  
  // Get total mascots in set
  const { data: setMascots } = await supabase
    .from('collection_set_mascots')
    .select('mascot_id')
    .eq('collection_set_id', collectionSetId);
  
  const total = setMascots?.length || 0;
  
  // Get user's collected mascots from this set
  const { data: userCollections } = await supabase
    .from('user_mascot_collections')
    .select('mascot_id')
    .eq('app_user_id', appUserId)
    .eq('collection_set_id', collectionSetId);
  
  const current = userCollections?.length || 0;
  
  return {
    current,
    total,
    collection_set_id: collectionSetId
  };
}
```

---

## 🎯 Implementation Checklist

### Database Setup
- [ ] Run `migrations/add_point_config_to_restaurants.sql` in **Back Office DB**
- [ ] Run `migrations/create_qr_code_scans_table.sql` in **Main DB**
- [ ] Run `migrations/create_user_mascot_collections_table.sql` in **Main DB**
- [ ] Run `migrations/create_rls_policies_qr_system.sql` in **Main DB** (RLS policies)

### Backend API
- [ ] Create QR code generation endpoint (for vendors)
- [ ] Create QR code scan processing endpoint
- [ ] Implement scan validation logic
- [ ] Implement daily limit check
- [ ] Implement mascot drop logic
- [ ] Implement collection progress calculation

### Frontend
- [ ] Update `QRScan.jsx` to call new scan API
- [ ] Handle "already scanned today" error message
- [ ] Update `RedeemedSuccess.jsx` to show collection progress
- [ ] Create admin interface for configuring points/mascot drops

### Testing
- [ ] Test QR code generation
- [ ] Test scanning once per day limit
- [ ] Test point awarding
- [ ] Test mascot drops
- [ ] Test collection progress tracking
- [ ] Test duplicate scan prevention

---

## 📊 Summary

**Tables Created:**
- ✅ 2 new tables (`qr_code_scans`, `user_mascot_collections`)
- ✅ Columns added to `restaurants` table

**Key Features:**
- ✅ One QR code per restaurant (generated on-the-fly)
- ✅ Once per day scanning limit
- ✅ Admin-configurable points and mascot drops
- ✅ Basic audit trail
- ✅ Collection progress tracking

**Files to Use:**
- `migrations/add_point_config_to_restaurants.sql` - Back Office DB
- `migrations/create_qr_code_scans_table.sql` - Main DB
- `migrations/create_user_mascot_collections_table.sql` - Main DB
- `migrations/create_rls_policies_qr_system.sql` - Main DB (RLS policies)

---

## 🔐 Row Level Security (RLS) Policies

**File**: `migrations/create_rls_policies_qr_system.sql`

RLS policies have been created following your existing patterns:

### QR Code Scans Table
- ✅ Users can view their own scan history
- ✅ **Vendors can view scans for their restaurants** (for analytics/engagement tracking)
- ✅ Users can create their own scan records (when scanning)
- ✅ Admins can view/update/delete all scans

### User Mascot Collections Table
- ✅ Users can view their own collections
- ✅ Users can create their own collection records (when collecting mascots)
- ✅ Admins can view/update/delete all collections
- ⚠️ Optional: Public can view collections (for leaderboards) - commented out by default

### Restaurants Table (New Columns)
- ✅ Existing restaurants policies already cover the new columns
- ✅ Vendors and admins can update restaurants (including point/mascot config)
- 💡 **Note**: Consider restricting point/mascot config updates to admins only (handle in application logic)

**Run this migration in your MAIN database after creating the tables.**

---

## 🚀 Next Steps

1. Run the migrations in the correct databases
2. Implement the backend API endpoints
3. Update the frontend to use the new API
4. Test thoroughly
5. Deploy!

For questions or issues, refer to:
- `docs/QR_CODE_SCALING_CONSIDERATIONS.md` - Future scaling options
- `docs/QR_CODE_MASCOT_IMPLEMENTATION_SIMPLIFIED.md` - Detailed explanation

