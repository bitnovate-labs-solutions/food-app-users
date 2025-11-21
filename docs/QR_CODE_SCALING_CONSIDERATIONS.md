# QR Code System - Scaling Considerations

## Requirements Analysis

### ✅ Confirmed Requirements
- **One QR code per restaurant** (simplified approach)
- **Users can scan once per DAY** (not once ever) - **IMPORTANT CHANGE**

### 🤔 Future Scaling Considerations

## 1. Per-QR-Code Tracking (Revoking Specific QR Codes)

### Is it important for scaling?

**Current Need: LOW** ✅
- One QR code per restaurant is sufficient for MVP
- Vendors can regenerate QR code if compromised
- Simple approach works for most cases

**Future Need: MEDIUM** ⚠️
- **Use Case**: Vendor wants to revoke a specific QR code without affecting others
- **Use Case**: Multiple QR codes for different promotions (e.g., "Scan QR code A for 10 points, QR code B for 20 points")
- **Use Case**: Time-limited QR codes (e.g., "Weekend special QR code")

**Recommendation:**
- ✅ **Start simple** - One QR code per restaurant
- ⚠️ **Add later if needed** - Can add `qr_codes` table when requirements emerge
- 💡 **Migration path**: Easy to migrate from simple to complex (add table, update logic)

## 2. Audit Trail (Who Configured Points, When)

### Is it important for scaling?

**Current Need: LOW** ✅
- Admins configure points - simple enough
- Can track changes via application logs if needed

**Future Need: HIGH** ⚠️⚠️⚠️
- **Compliance**: May need to prove who changed what and when
- **Debugging**: "Why did this restaurant's points change?"
- **Accountability**: Track admin actions for security
- **Analytics**: Understand point configuration trends

**Recommendation:**
- ⚠️ **Consider adding early** - Audit trails are hard to add retroactively
- 💡 **Simple solution**: Add `configured_by` and `configured_at` columns to restaurants table
- 💡 **Full solution**: Separate `restaurant_point_configs` table with history

**Compromise:**
```sql
-- Add audit columns to restaurants table (simple)
ALTER TABLE restaurants ADD COLUMN configured_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN configured_at timestamptz DEFAULT now();
ALTER TABLE restaurants ADD COLUMN last_modified_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN last_modified_at timestamptz DEFAULT now();
```

## 3. Once Per Day Scanning (Updated Requirement)

### Implementation Change Required

**Current**: `UNIQUE(profile_id, restaurant_id)` - prevents scanning forever
**Required**: `UNIQUE(profile_id, restaurant_id, date)` - prevents scanning once per day

**Solution Options:**

### Option A: Date-based Unique Constraint (Recommended)
```sql
-- Add date column and use partial unique index
ALTER TABLE qr_code_scans ADD COLUMN scan_date date DEFAULT CURRENT_DATE;

-- Create unique constraint on (profile_id, restaurant_id, scan_date)
CREATE UNIQUE INDEX idx_qr_scans_daily 
ON qr_code_scans(profile_id, restaurant_id, scan_date);
```

**Benefits:**
- ✅ Database-level enforcement (can't cheat)
- ✅ Simple queries (just check date)
- ✅ Efficient (indexed)

### Option B: Application Logic (Not Recommended)
```javascript
// Check if scanned today
const today = new Date().toISOString().split('T')[0];
const { data } = await supabase
  .from('qr_code_scans')
  .select('id')
  .eq('profile_id', profileId)
  .eq('restaurant_id', restaurantId)
  .gte('scanned_at', `${today}T00:00:00Z`)
  .single();
```

**Drawbacks:**
- ❌ Race conditions possible
- ❌ Timezone issues
- ❌ Less efficient

---

## Updated Simplified Schema

### 1. Restaurants Table (Add Audit Columns)

```sql
-- Point and mascot configuration
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS base_points integer DEFAULT 1 CHECK (base_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS bonus_points integer DEFAULT 0 CHECK (bonus_points >= 0);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_enabled boolean DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS mascot_drop_rate numeric(5,2) DEFAULT 0.0 CHECK (mascot_drop_rate >= 0 AND mascot_drop_rate <= 100);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS collection_set_id uuid;

-- Audit trail (simple but effective)
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS configured_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS configured_at timestamptz DEFAULT now();
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS last_modified_by uuid REFERENCES profiles(id);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS last_modified_at timestamptz DEFAULT now();
```

### 2. QR Code Scans (Once Per Day)

```sql
CREATE TABLE IF NOT EXISTS qr_code_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL,
  
  -- Scan result
  points_earned integer DEFAULT 0 CHECK (points_earned >= 0),
  mascot_dropped boolean DEFAULT false,
  mascot_id uuid REFERENCES mascots(id),
  
  -- Metadata
  scanned_at timestamptz DEFAULT now(),
  scan_date date DEFAULT CURRENT_DATE, -- For daily limit enforcement
  
  -- Prevent duplicate scans per day (same user cannot scan same restaurant twice in one day)
  UNIQUE(profile_id, restaurant_id, scan_date)
);

CREATE INDEX IF NOT EXISTS idx_qr_scans_profile ON qr_code_scans(profile_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_restaurant ON qr_code_scans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_code_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_daily ON qr_code_scans(profile_id, restaurant_id, scan_date); -- For daily limit
```

### 3. User Mascot Collections (Unchanged)

```sql
CREATE TABLE IF NOT EXISTS user_mascot_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mascot_id uuid NOT NULL REFERENCES mascots(id) ON DELETE CASCADE,
  collection_set_id uuid REFERENCES collection_sets(id),
  
  collected_at timestamptz DEFAULT now(),
  collected_from text CHECK (collected_from IN ('qr_scan', 'treasure_hunt', 'purchase', 'reward')),
  restaurant_id uuid,
  
  UNIQUE(profile_id, mascot_id)
);
```

---

## Updated Scan Processing Logic

```javascript
async function processQRCodeScan(qrData, profileId) {
  const { restaurant_id } = qrData;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 1. Validate QR code
  if (!validateQRCode(qrData)) {
    throw new Error('Invalid QR code');
  }
  
  // 2. Get restaurant config
  const restaurant = await getRestaurant(restaurant_id);
  if (!restaurant || restaurant.status !== 'active') {
    throw new Error('Restaurant not found or inactive');
  }
  
  // 3. Check if already scanned TODAY
  const { data: existingScan } = await supabase
    .from('qr_code_scans')
    .select('id')
    .eq('profile_id', profileId)
    .eq('restaurant_id', restaurant_id)
    .eq('scan_date', today)
    .single();
  
  if (existingScan) {
    throw new Error('You have already scanned this restaurant today. Come back tomorrow!');
  }
  
  // 4. Calculate points
  const pointsEarned = (restaurant.base_points || 1) + (restaurant.bonus_points || 0);
  
  // 5. Determine mascot drop (same logic as before)
  let mascot = null;
  let isNewMascot = false;
  
  if (restaurant.mascot_drop_enabled) {
    const dropRate = restaurant.mascot_drop_rate || 0;
    if (Math.random() * 100 <= dropRate) {
      mascot = await selectRandomMascotFromSet(restaurant.collection_set_id, profileId);
      if (mascot) {
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
  
  // 7. Record scan (with today's date)
  await supabase.from('qr_code_scans').insert({
    profile_id: profileId,
    restaurant_id: restaurant_id,
    points_earned: pointsEarned,
    mascot_dropped: !!mascot,
    mascot_id: mascot?.id,
    scan_date: today
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

## Final Recommendation

### ✅ Implement Now (Essential)
1. **Once per day scanning** - Add `scan_date` column and unique constraint
2. **Basic audit trail** - Add `configured_by`, `configured_at` columns to restaurants
3. **Simple point config** - Add columns to restaurants table

### ⚠️ Add Later (If Needed)
1. **Per-QR-code tracking** - Add `qr_codes` table when requirements emerge
2. **Full audit history** - Add `restaurant_point_configs` table with history if compliance needed

### 📊 Summary Table

| Feature | Current Need | Future Need | Priority |
|---------|-------------|-------------|----------|
| Once per day scanning | ✅ **ESSENTIAL** | ✅ **ESSENTIAL** | **HIGH** |
| Basic audit trail | ⚠️ Medium | ✅ **HIGH** | **MEDIUM** |
| Per-QR-code tracking | ❌ Low | ⚠️ Medium | **LOW** |
| Full audit history | ❌ Low | ⚠️ Medium | **LOW** |

---

## Migration Path

**Phase 1 (Now)**: Simple approach with daily limits + basic audit
- ✅ Add columns to restaurants
- ✅ Add scan_date to qr_code_scans
- ✅ Add basic audit columns

**Phase 2 (If needed)**: Add complexity
- Add `qr_codes` table for per-code tracking
- Add `restaurant_point_configs` table for full audit history
- Migrate data from restaurants columns to new tables

This approach gives you:
- ✅ **Scalability** - Can add complexity when needed
- ✅ **Performance** - Simple queries, fast
- ✅ **Maintainability** - Easy to understand
- ✅ **Flexibility** - Can evolve as requirements change

