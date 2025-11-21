# QR Code Scanning & Mascot Collection System - Simplified Implementation

## Analysis: What's Actually Needed?

### ❌ **Over-engineered Tables:**

1. **`qr_codes` table** - **NOT NEEDED**
   - QR codes can be generated on-the-fly using: `hash(restaurant_id + secret_key)`
   - No need to store every QR code in database
   - Vendors can generate QR codes themselves using a simple algorithm
   - **Exception**: Only needed if you want to track/revoke specific QR codes

2. **`restaurant_point_configs` table** - **CAN BE SIMPLIFIED**
   - Can be merged into `restaurants` table as columns
   - Simpler queries, no joins needed
   - **Exception**: Only needed if you want audit trail of who configured what

### ✅ **Essential Tables:**

1. **`qr_code_scans`** - **ESSENTIAL**
   - Prevents duplicate scans (same user scanning same QR twice)
   - Tracks scan history for analytics
   - **Cannot be avoided** - this is core functionality

2. **`user_mascot_collections`** - **ESSENTIAL**
   - Tracks which mascots each user has collected
   - Needed to show collection progress (4/7)
   - **Doesn't exist in current schema** - must be added

---

## Simplified Schema (2 Tables Only)

### Option 1: Minimal (Recommended)

#### 1. Add columns to `restaurants` table (Back Office DB)

```sql
-- Add point and mascot configuration directly to restaurants table
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS base_points integer DEFAULT 1 CHECK (base_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0 CHECK (bonus_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_enabled boolean DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS collection_set_id uuid; -- References collection_sets(id) in main DB
```

**Benefits:**
- ✅ No joins needed - all data in one table
- ✅ Simpler queries
- ✅ Less database overhead
- ✅ Easier to understand

**Trade-offs:**
- ❌ No audit trail (who configured what, when)
- ❌ Can't have multiple configurations per restaurant over time

#### 2. QR Code Scans Table (Main DB) - **ESSENTIAL**

```sql
CREATE TABLE IF NOT EXISTS qr_code_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL, -- References restaurants(id) in back office DB
  
  -- Scan result
  points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
  mascot_dropped boolean DEFAULT false,
  mascot_id uuid REFERENCES mascots(id), -- If mascot was dropped
  
  -- Metadata
  scanned_at timestamptz DEFAULT now(),
  
  -- Prevent duplicate scans (same user cannot scan same restaurant's QR twice)
  UNIQUE(profile_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_profile ON qr_code_scans(profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_restaurant ON qr_code_scans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_code_scans(scanned_at DESC);
```

**Why this works:**
- QR code contains `restaurant_id`
- We validate the QR code by checking if restaurant exists
- We prevent duplicates using `UNIQUE(profile_id, restaurant_id)`
- Simple and efficient

#### 3. User Mascot Collections (Main DB) - **ESSENTIAL**

```sql
CREATE TABLE IF NOT EXISTS user_mascot_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL REFERENCES mascots(id) ON DELETE CASCADE,
  collection_set_id uuid REFERENCES collection_sets(id),
  
  -- Collection metadata
  collected_at timestamptz DEFAULT now(),
  collected_from text CHECK (collected_from IN ('qr_scan', 'treasure_hunt', 'purchase', 'reward')),
  restaurant_id uuid, -- If collected from QR scan
  
  -- Prevent duplicate collections
  UNIQUE(profile_id, mascot_id)
);

CREATE INDEX IF NOT EXISTS idx_user_collections_profile ON user_mascot_collections(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_set ON user_mascot_collections(collection_set_id);
```

---

## QR Code Generation (Simplified)

### Simple Approach: Generate on-the-fly

```javascript
// Generate QR code data (no database storage needed)
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

// Validate QR code
function validateQRCode(qrData) {
  // 1. Check if restaurant exists
  const restaurant = await getRestaurant(qrData.restaurant_id);
  if (!restaurant) return false;
  
  // 2. Verify hash matches
  const expectedHash = generateQRCodeData(qrData.restaurant_id).hash;
  return qrData.hash === expectedHash;
}
```

**Benefits:**
- ✅ No database storage needed
- ✅ QR codes can't be tampered with (hash verification)
- ✅ Vendors can generate QR codes themselves
- ✅ Simple and efficient

---

## Scan Processing (Simplified)

```javascript
async function processQRCodeScan(qrData, profileId) {
  const { restaurant_id } = qrData;
  
  // 1. Validate QR code
  if (!validateQRCode(qrData)) {
    throw new Error('Invalid QR code');
  }
  
  // 2. Get restaurant config (from restaurants table)
  const restaurant = await getRestaurant(restaurant_id);
  if (!restaurant || restaurant.status !== 'active') {
    throw new Error('Restaurant not found or inactive');
  }
  
  // 3. Check if already scanned
  const { data: existingScan } = await supabase
    .from('qr_code_scans')
    .select('id')
    .eq('profile_id', profileId)
    .eq('restaurant_id', restaurant_id)
    .single();
  
  if (existingScan) {
    throw new Error('Already scanned this restaurant');
  }
  
  // 4. Calculate points
  const pointsEarned = (restaurant.base_points || 1) + (restaurant.bonus_points || 0);
  
  // 5. Determine mascot drop
  let mascot = null;
  let isNewMascot = false;
  
  if (restaurant.mascot_drop_enabled) {
    const dropRate = restaurant.mascot_drop_rate || 0;
    if (Math.random() * 100 <= dropRate) {
      mascot = await selectRandomMascotFromSet(restaurant.collection_set_id, profileId);
      if (mascot) {
        // Check if new
        const { data: existing } = await supabase
          .from('user_mascot_collections')
          .select('id')
          .eq('profile_id', profileId)
          .eq('mascot_id', mascot.id)
          .single();
        
        isNewMascot = !existing;
        
        if (isNewMascot) {
          await supabase.from('user_mascot_collections').insert({
            profile_id: profileId,
            mascot_id: mascot.id,
            collection_set_id: restaurant.collection_set_id,
            collected_from: 'qr_scan',
            restaurant_id: restaurant_id
          });
        }
      }
    }
  }
  
  // 6. Update points
  await updateUserPoints(profileId, pointsEarned);
  
  // 7. Record scan
  await supabase.from('qr_code_scans').insert({
    profile_id: profileId,
    restaurant_id: restaurant_id,
    points_earned: pointsEarned,
    mascot_dropped: !!mascot,
    mascot_id: mascot?.id
  });
  
  // 8. Get collection progress
  const progress = await getCollectionProgress(profileId, restaurant.collection_set_id);
  
  return {
    points_earned: pointsEarned,
    mascot,
    is_new_mascot: isNewMascot,
    collection_progress: progress
  };
}
```

---

## Comparison: Original vs Simplified

| Feature | Original (4 tables) | Simplified (2 tables) |
|---------|-------------------|---------------------|
| **Tables** | qr_codes, qr_code_scans, user_mascot_collections, restaurant_point_configs | qr_code_scans, user_mascot_collections |
| **Restaurant Config** | Separate table (joins needed) | Columns in restaurants table |
| **QR Code Storage** | Database table | Generated on-the-fly |
| **Queries** | Multiple joins | Simple queries |
| **Complexity** | High | Low |
| **Performance** | Slower (joins) | Faster (no joins) |
| **Maintenance** | More complex | Simpler |

---

## When to Use Original vs Simplified?

### Use **Simplified** (Recommended) if:
- ✅ You don't need to track individual QR codes
- ✅ You don't need QR code expiration per-code
- ✅ You don't need audit trail of point configuration
- ✅ You want simpler, faster queries
- ✅ You want less database overhead

### Use **Original** (4 tables) if:
- ✅ You need to revoke specific QR codes
- ✅ You need per-QR-code expiration dates
- ✅ You need audit trail (who configured what)
- ✅ You need multiple QR codes per restaurant
- ✅ You need scan limits per QR code

---

## Recommendation

**Start with the simplified approach (2 tables)**. It's:
- ✅ More efficient (fewer joins, simpler queries)
- ✅ Easier to understand and maintain
- ✅ Follows KISS principle (Keep It Simple, Stupid)
- ✅ Can always add complexity later if needed

You can always migrate to the more complex schema later if requirements change.

