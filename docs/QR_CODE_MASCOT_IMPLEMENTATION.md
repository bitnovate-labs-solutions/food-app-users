# QR Code Scanning & Mascot Collection System Implementation

## Overview

This document outlines the complete implementation for the QR code scanning and mascot collection system, where:
- **Vendors/Restaurants** generate their own QR codes
- **Users** scan QR codes to collect points and mascots
- **Admins** configure point values and mascot drop rates
- **Collection progress** is tracked per collection set

---

## 1. Database Schema Additions

### 1.1 QR Codes Table (Back Office Database)

```sql
-- QR codes table for restaurants/vendors
CREATE TABLE qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- QR code data
  qr_code_hash text NOT NULL UNIQUE, -- Unique hash/identifier for the QR code
  qr_code_data jsonb NOT NULL, -- Full QR code payload (JSON)
  
  -- Point configuration (set by admin)
  points_awarded integer DEFAULT 1 CHECK (points_awarded >= 0),
  
  -- Mascot drop configuration (set by admin)
  mascot_drop_enabled boolean DEFAULT false,
  mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100), -- Percentage (0-100)
  collection_set_id uuid, -- Which collection set this QR code can drop mascots from
  
  -- Status and metadata
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'suspended')),
  expires_at timestamptz,
  max_scans integer, -- Optional: limit number of scans per QR code
  current_scans integer DEFAULT 0,
  
  -- Generation metadata
  generated_by uuid REFERENCES profiles(id), -- Vendor/admin who generated it
  generated_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_qr_codes_hash ON qr_codes(qr_code_hash);
CREATE INDEX idx_qr_codes_restaurant ON qr_codes(restaurant_id);
CREATE INDEX idx_qr_codes_vendor ON qr_codes(vendor_id);
CREATE INDEX idx_qr_codes_status ON qr_codes(status) WHERE status = 'active';
```

### 1.2 QR Code Scan Logs (Main Database)

```sql
-- Track all QR code scans to prevent duplicates
CREATE TABLE qr_code_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  qr_code_hash text NOT NULL, -- References qr_codes.qr_code_hash
  
  -- Scan result
  points_earned integer DEFAULT 0,
  mascot_dropped boolean DEFAULT false,
  mascot_id uuid REFERENCES mascots(id), -- If mascot was dropped
  
  -- Metadata
  scanned_at timestamptz DEFAULT now(),
  restaurant_id uuid, -- For quick reference
  vendor_id uuid, -- For quick reference
  
  -- Prevent duplicate scans
  UNIQUE(profile_id, qr_code_hash)
);

-- Indexes
CREATE INDEX idx_qr_scans_profile ON qr_code_scans(profile_id);
CREATE INDEX idx_qr_scans_hash ON qr_code_scans(qr_code_hash);
CREATE INDEX idx_qr_scans_date ON qr_code_scans(scanned_at DESC);
```

### 1.3 User Mascot Collections (Main Database)

```sql
-- Track which mascots users have collected
CREATE TABLE user_mascot_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL REFERENCES mascots(id) ON DELETE CASCADE,
  collection_set_id uuid REFERENCES collection_sets(id),
  
  -- Collection metadata
  collected_at timestamptz DEFAULT now(),
  collected_from text, -- 'qr_scan', 'treasure_hunt', 'purchase', 'reward'
  qr_code_hash text, -- If collected from QR scan
  restaurant_id uuid, -- If collected from restaurant QR
  
  -- Prevent duplicate collections (user can only collect same mascot once)
  UNIQUE(profile_id, mascot_id)
);

-- Indexes
CREATE INDEX idx_user_collections_profile ON user_mascot_collections(profile_id);
CREATE INDEX idx_user_collections_mascot ON user_mascot_collections(mascot_id);
CREATE INDEX idx_user_collections_set ON user_mascot_collections(collection_set_id);
CREATE INDEX idx_user_collections_date ON user_mascot_collections(collected_at DESC);
```

### 1.4 Restaurant Point Configuration (Back Office Database)

```sql
-- Admin-configurable point values per restaurant
CREATE TABLE restaurant_point_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_id uuid REFERENCES vendors(id),
  
  -- Point configuration
  base_points integer DEFAULT 1 CHECK (base_points >= 0),
  bonus_points integer DEFAULT 0 CHECK (bonus_points >= 0),
  
  -- Mascot configuration
  mascot_drop_enabled boolean DEFAULT false,
  mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100),
  collection_set_id uuid REFERENCES collection_sets(id), -- Which collection set
  
  -- Configuration metadata
  configured_by uuid REFERENCES profiles(id), -- Admin who configured
  configured_at timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(restaurant_id)
);

-- Indexes
CREATE INDEX idx_restaurant_point_configs_restaurant ON restaurant_point_configs(restaurant_id);
CREATE INDEX idx_restaurant_point_configs_vendor ON restaurant_point_configs(vendor_id);
```

---

## 2. QR Code Generation System

### 2.1 QR Code Format

QR codes should contain JSON data with the following structure:

```json
{
  "type": "restaurant_qr",
  "restaurant_id": "uuid",
  "vendor_id": "uuid",
  "qr_code_hash": "unique_hash_string",
  "generated_at": "2024-01-01T00:00:00Z"
}
```

### 2.2 Vendor QR Code Generation API

**Endpoint**: `POST /api/vendors/generate-qr-code`

**Request Body**:
```json
{
  "restaurant_id": "uuid",
  "expires_at": "2024-12-31T23:59:59Z", // Optional
  "max_scans": 1000 // Optional
}
```

**Response**:
```json
{
  "qr_code": {
    "id": "uuid",
    "qr_code_hash": "abc123...",
    "qr_code_data": { /* full QR payload */ },
    "qr_code_image_url": "https://...", // Generated QR code image
    "points_awarded": 1,
    "status": "active"
  }
}
```

**Implementation Logic**:
1. Generate unique `qr_code_hash` (e.g., using `crypto.randomUUID()` + restaurant_id)
2. Create QR code record in `qr_codes` table
3. Generate QR code image using a library (e.g., `qrcode` npm package)
4. Upload QR code image to Supabase Storage
5. Return QR code data and image URL

### 2.3 QR Code Generation Function (Backend)

```javascript
// Example: Generate QR code for restaurant
async function generateRestaurantQRCode(restaurantId, vendorId, options = {}) {
  const qrCodeHash = generateUniqueHash(restaurantId);
  
  const qrCodeData = {
    type: 'restaurant_qr',
    restaurant_id: restaurantId,
    vendor_id: vendorId,
    qr_code_hash: qrCodeHash,
    generated_at: new Date().toISOString()
  };
  
  // Get point configuration from restaurant_point_configs
  const pointConfig = await getRestaurantPointConfig(restaurantId);
  
  // Create QR code record
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .insert({
      restaurant_id: restaurantId,
      vendor_id: vendorId,
      qr_code_hash: qrCodeHash,
      qr_code_data: qrCodeData,
      points_awarded: pointConfig?.base_points || 1,
      mascot_drop_enabled: pointConfig?.mascot_drop_enabled || false,
      mascot_drop_rate: pointConfig?.mascot_drop_rate || 0,
      collection_set_id: pointConfig?.collection_set_id,
      expires_at: options.expires_at,
      max_scans: options.max_scans,
      generated_by: vendorId,
      status: 'active'
    })
    .select()
    .single();
  
  // Generate QR code image
  const qrCodeImage = await generateQRCodeImage(JSON.stringify(qrCodeData));
  
  // Upload to storage
  const imageUrl = await uploadQRCodeImage(qrCodeImage, qrCodeHash);
  
  return {
    ...qrCode,
    qr_code_image_url: imageUrl
  };
}
```

---

## 3. QR Code Scanning & Collection Logic

### 3.1 Scan Processing Flow

```
1. User scans QR code → QRScan.jsx
2. Parse QR code data (JSON)
3. Validate QR code (check hash, expiration, status)
4. Check if already scanned (query qr_code_scans)
5. Calculate points (from restaurant_point_configs or qr_codes)
6. Determine mascot drop (based on drop rate)
7. Update user points (app_users table)
8. Record scan (qr_code_scans table)
9. If mascot dropped: add to user_mascot_collections
10. Return result to frontend
```

### 3.2 Scan Processing API

**Endpoint**: `POST /api/qr-scan/process`

**Request Body**:
```json
{
  "qr_code_data": { /* parsed QR code JSON */ },
  "user_id": "profile_id"
}
```

**Response**:
```json
{
  "success": true,
  "points_earned": 1,
  "mascot_dropped": false,
  "mascot": null, // or mascot object if dropped
  "is_new_mascot": false,
  "collection_progress": {
    "current": 4,
    "total": 7,
    "collection_set_id": "uuid"
  },
  "is_collection_complete": false,
  "message": "Points collected successfully!"
}
```

### 3.3 Scan Processing Function (Backend)

```javascript
async function processQRCodeScan(qrCodeData, profileId) {
  const { qr_code_hash, restaurant_id, vendor_id } = qrCodeData;
  
  // 1. Validate QR code exists and is active
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*, restaurant_point_configs(*)')
    .eq('qr_code_hash', qr_code_hash)
    .eq('status', 'active')
    .single();
  
  if (!qrCode) {
    throw new Error('Invalid or inactive QR code');
  }
  
  // 2. Check expiration
  if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
    throw new Error('QR code has expired');
  }
  
  // 3. Check if already scanned
  const { data: existingScan } = await supabase
    .from('qr_code_scans')
    .select('id')
    .eq('profile_id', profileId)
    .eq('qr_code_hash', qr_code_hash)
    .single();
  
  if (existingScan) {
    throw new Error('This QR code has already been scanned');
  }
  
  // 4. Check scan limit
  if (qrCode.max_scans && qrCode.current_scans >= qrCode.max_scans) {
    throw new Error('QR code scan limit reached');
  }
  
  // 5. Get point configuration
  const pointConfig = qrCode.restaurant_point_configs?.[0] || {
    base_points: qrCode.points_awarded || 1,
    bonus_points: 0
  };
  const pointsEarned = pointConfig.base_points + pointConfig.bonus_points;
  
  // 6. Determine mascot drop
  let mascotDropped = false;
  let mascot = null;
  let isNewMascot = false;
  
  if (qrCode.mascot_drop_enabled || pointConfig.mascot_drop_enabled) {
    const dropRate = qrCode.mascot_drop_rate || pointConfig.mascot_drop_rate || 0;
    const randomValue = Math.random() * 100;
    
    if (randomValue <= dropRate) {
      // Mascot dropped! Select a random mascot from the collection set
      const collectionSetId = qrCode.collection_set_id || pointConfig.collection_set_id;
      mascot = await selectRandomMascotFromSet(collectionSetId, profileId);
      
      if (mascot) {
        mascotDropped = true;
        
        // Check if user already has this mascot
        const { data: existingCollection } = await supabase
          .from('user_mascot_collections')
          .select('id')
          .eq('profile_id', profileId)
          .eq('mascot_id', mascot.id)
          .single();
        
        isNewMascot = !existingCollection;
        
        // Add to collection if new
        if (isNewMascot) {
          await supabase
            .from('user_mascot_collections')
            .insert({
              profile_id: profileId,
              mascot_id: mascot.id,
              collection_set_id: collectionSetId,
              collected_from: 'qr_scan',
              qr_code_hash: qr_code_hash,
              restaurant_id: restaurant_id
            });
        }
      }
    }
  }
  
  // 7. Update user points
  const { data: appUser } = await supabase
    .from('app_users')
    .select('points_balance, total_points_earned')
    .eq('profile_id', profileId)
    .single();
  
  await supabase
    .from('app_users')
    .update({
      points_balance: (appUser.points_balance || 0) + pointsEarned,
      total_points_earned: (appUser.total_points_earned || 0) + pointsEarned,
      updated_at: new Date().toISOString()
    })
    .eq('profile_id', profileId);
  
  // 8. Record scan
  await supabase
    .from('qr_code_scans')
    .insert({
      profile_id: profileId,
      qr_code_hash: qr_code_hash,
      points_earned: pointsEarned,
      mascot_dropped: mascotDropped,
      mascot_id: mascot?.id,
      restaurant_id: restaurant_id,
      vendor_id: vendor_id
    });
  
  // 9. Update QR code scan count
  await supabase
    .from('qr_codes')
    .update({
      current_scans: qrCode.current_scans + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', qrCode.id);
  
  // 10. Calculate collection progress
  const collectionProgress = await getCollectionProgress(
    profileId,
    qrCode.collection_set_id || pointConfig.collection_set_id
  );
  
  return {
    success: true,
    points_earned: pointsEarned,
    mascot_dropped: mascotDropped,
    mascot: mascot,
    is_new_mascot: isNewMascot,
    collection_progress: collectionProgress,
    is_collection_complete: collectionProgress.current === collectionProgress.total
  };
}
```

### 3.4 Helper Functions

```javascript
// Select random mascot from collection set
async function selectRandomMascotFromSet(collectionSetId, profileId) {
  // Get all mascots in the collection set
  const { data: setMascots } = await supabase
    .from('collection_set_mascots')
    .select('mascot_id, mascots(*)')
    .eq('collection_set_id', collectionSetId);
  
  if (!setMascots || setMascots.length === 0) {
    return null;
  }
  
  // Select random mascot
  const randomIndex = Math.floor(Math.random() * setMascots.length);
  return setMascots[randomIndex].mascots;
}

// Get collection progress
async function getCollectionProgress(profileId, collectionSetId) {
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
    .eq('profile_id', profileId)
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

## 4. Frontend Integration

### 4.1 Update QRScan.jsx

```javascript
// In handleScanSuccess function
const handleScanSuccess = useCallback(
  async (decodedText) => {
    // ... existing code ...
    
    try {
      // Parse QR code
      const qrData = JSON.parse(decodedText);
      
      // Call scan processing API
      const response = await fetch(
        'https://your-api.com/api/qr-scan/process',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            qr_code_data: qrData,
            user_id: profile.id
          })
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process QR code');
      }
      
      // Navigate to redeemed success page
      navigate('/redeemed-success', {
        state: {
          pointsEarned: result.points_earned,
          mascot: result.mascot,
          isNewMascot: result.is_new_mascot,
          collectionProgress: result.collection_progress,
          isCollectionComplete: result.is_collection_complete
        }
      });
      
    } catch (error) {
      // Handle errors
      toast.error(error.message);
    }
  },
  [user, navigate, session]
);
```

---

## 5. Admin Configuration Interface

### 5.1 Admin Point Configuration

Admins should be able to:
1. Set base points per restaurant
2. Set bonus points (optional)
3. Enable/disable mascot drops
4. Set mascot drop rate (0-100%)
5. Assign collection set for mascot drops

### 5.2 Admin Mascot Management

Admins should be able to:
1. Create mascots
2. Assign mascots to collection sets
3. Set mascot rarity
4. Upload mascot images
5. Configure collection set rewards

---

## 6. Database Migration Scripts

Create migration files:
- `migrations/create_qr_codes_table.sql`
- `migrations/create_qr_code_scans_table.sql`
- `migrations/create_user_mascot_collections_table.sql`
- `migrations/create_restaurant_point_configs_table.sql`

---

## 7. Security Considerations

1. **RLS Policies**: Enable RLS on all new tables
2. **QR Code Validation**: Always validate QR code hash server-side
3. **Duplicate Prevention**: Use database constraints (UNIQUE) to prevent duplicate scans
4. **Rate Limiting**: Implement rate limiting on scan API
5. **Admin Access**: Restrict point/mascot configuration to admin role only

---

## 8. Testing Checklist

- [ ] QR code generation works for vendors
- [ ] QR code scanning awards points correctly
- [ ] Duplicate scans are prevented
- [ ] Mascot drops work based on drop rate
- [ ] Collection progress is tracked correctly
- [ ] Collection complete state works
- [ ] Admin can configure points per restaurant
- [ ] Admin can configure mascot drop rates
- [ ] Expired QR codes are rejected
- [ ] Scan limits are enforced

---

## 9. Next Steps

1. Create database migration scripts
2. Implement QR code generation API
3. Implement scan processing API
4. Update frontend QRScan component
5. Create admin configuration interface
6. Add RLS policies
7. Write tests
8. Deploy to production

