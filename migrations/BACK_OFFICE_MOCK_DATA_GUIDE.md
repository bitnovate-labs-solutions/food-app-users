# Back Office Mock Data Guide

## Overview

This guide explains the mock data structure for Malaysian food vendors, restaurants, and menu items.

## File

- `migrations/insert_back_office_mock_data.sql` - Contains all mock data

## Data Structure

### 1. **Vendors** (10 vendors)
- Malaysian business names and owner names
- Locations across Malaysia (KL, Penang, Selangor, Melaka)
- Mix of verified and pending status
- Contact information (email, phone)

### 2. **Restaurants** (10 restaurants)
- Each vendor has 1 restaurant
- Malaysian cuisine types: Mamak, Chinese, Indian, Other
- Food categories: Halal, Non-Halal
- Locations in various Malaysian cities
- Mix of active and pending status

### 3. **Menu Categories** (Optional)
- Each restaurant has 2-4 categories
- Common categories: Main dishes, Side dishes, Beverages
- Categories are optional - menu items can exist without categories

### 4. **Menu Items** (50 items total)
- Malaysian food names and descriptions
- Prices in Malaysian Ringgit (RM)
- Linked to restaurants and optionally to categories
- All items are available by default

## Menu Categories Relationship

### How It Works:
```
Restaurant
  └── Menu Categories (optional)
        └── Menu Items (can belong to a category OR be uncategorized)
```

### Example:
- **Nasi Lemak Pak Ali** restaurant has:
  - Category: "Nasi Lemak Sets" → Contains: Nasi Lemak Ayam, Nasi Lemak Rendang
  - Category: "Side Dishes" → Contains: Sambal Sotong
  - Category: "Beverages" → Contains: Teh Tarik, Kopi O

### Important Notes:
- **Categories are optional** - You can remove them if not needed
- **Menu items can have `category_id = NULL`** - They'll still work without categories
- **Categories help organize menus** - Makes it easier to display grouped items

## Malaysian Food Items Included

1. **Nasi Lemak Pak Ali**
   - Nasi Lemak varieties (Ayam, Rendang, Ikan Bilis)
   - Side dishes (Sambal Sotong)
   - Beverages (Teh Tarik, Kopi O)

2. **Char Kuey Teow Master**
   - Char Kuey Teow (regular and special)
   - Hokkien Mee
   - Beverages

3. **Roti Canai Corner**
   - Various roti options (Canai, Telur, Bawang, Planta)
   - Curries (Chicken Curry)
   - Beverages

4. **Bak Kut Teh House**
   - Bak Kut Teh (Pork Ribs, Mixed)
   - Rice and sides
   - Chinese tea

5. **Hainanese Chicken Rice**
   - Chicken Rice (Quarter, Half, Whole)
   - Steamed Chicken
   - Beverages

6. **Laksa Penang**
   - Laksa varieties
   - Add-ons
   - Beverages

7. **Satay Kajang**
   - Satay (Chicken, Beef, Mutton)
   - Ketupat
   - Beverages

8. **Rendang Tok**
   - Rendang (Beef, Chicken)
   - Rice and sides
   - Beverages

9. **Mamak Stall 24/7**
   - Roti varieties
   - Nasi Lemak
   - Mee Goreng
   - Beverages

10. **Cendol Durian**
    - Cendol varieties
    - Durian specials
    - Ice Kacang

## Setup Instructions

### Step 1: Update User IDs
The `vendors` table uses `gen_random_uuid()` for `user_id`. You have two options:

**Option A: Use actual auth.users IDs**
```sql
-- First, get actual user IDs from your auth.users table
SELECT id FROM auth.users LIMIT 10;

-- Then replace gen_random_uuid() in the vendors INSERT with actual IDs
```

**Option B: Keep gen_random_uuid() for testing**
- This works if you're just testing the structure
- You won't be able to link vendors to actual authenticated users
- Good for development/testing

### Step 2: Run the SQL File
1. Go to your **Back Office Supabase Dashboard** (VITE_SECOND_SUPABASE_URL)
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `migrations/insert_back_office_mock_data.sql`
4. Click **"Run"** to execute

### Step 3: Verify Data
```sql
-- Check vendors
SELECT COUNT(*) FROM vendors; -- Should return 10

-- Check restaurants
SELECT COUNT(*) FROM restaurants; -- Should return 10

-- Check menu categories
SELECT COUNT(*) FROM menu_categories; -- Should return 31

-- Check menu items
SELECT COUNT(*) FROM menu_items; -- Should return 50

-- Check restaurant with menu items
SELECT 
  r.name,
  COUNT(mi.id) as menu_item_count
FROM restaurants r
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
GROUP BY r.id, r.name;
```

## Customization

### Remove Menu Categories
If you don't want to use categories:
1. Remove the `menu_categories` INSERT section
2. Set all `category_id` to `NULL` in `menu_items` INSERT
3. Remove the `category_id` column from menu_items INSERT (or keep it as NULL)

### Add More Data
You can easily extend the data by:
1. Adding more vendors
2. Adding more restaurants per vendor
3. Adding more menu items per restaurant
4. Adding more categories per restaurant

### Update Prices
All prices are in Malaysian Ringgit (RM). Adjust as needed:
- Street food: RM 2-10
- Restaurant meals: RM 10-25
- Premium items: RM 25+

## Data Relationships

```
vendors (1) ──→ (many) restaurants
restaurants (1) ──→ (many) menu_categories (optional)
restaurants (1) ──→ (many) menu_items
menu_categories (1) ──→ (many) menu_items (optional)
```

## Notes

- All prices are in Malaysian Ringgit (RM)
- Image URLs are NULL - add actual URLs later
- All restaurants are 'active' except Cendol Durian which is 'pending'
- Food categories match Malaysian dietary requirements (Halal/Non-Halal)
- Operating hours are in Malaysian time (GMT+8)
- Phone numbers use Malaysian format (+60)

## Troubleshooting

### Error: Foreign key constraint violation
- Make sure you run the INSERT statements in order:
  1. vendors
  2. restaurants (references vendors)
  3. menu_categories (references restaurants)
  4. menu_items (references restaurants and menu_categories)

### Error: Duplicate key violation
- The UUIDs are hardcoded - if you run the script twice, you'll get duplicates
- Either delete existing data first, or modify the UUIDs

### Menu items not showing
- Check that `is_available = true`
- Check that restaurant `status = 'active'`
- Verify the `restaurant_id` matches an existing restaurant

