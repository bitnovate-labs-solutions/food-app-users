# Menu Item Ratings Setup Guide

## Database Design Decision

**Recommendation: Use a separate `menu_item_reviews` table** (NOT add fields to `menu_items` table)

### Why a Separate Table?

1. **Consistency**: Matches the pattern used for restaurant reviews (`reviews` table)
2. **Normalization**: Follows database normalization best practices
3. **Flexibility**: Allows tracking individual reviews, not just aggregated ratings
4. **Scalability**: Can add more review features later (helpful votes, replies, etc.)
5. **Data Integrity**: Can track review history, soft deletes, moderation

### Alternative: Add Fields to `menu_items` Table

If you prefer a simpler approach, you could add these fields to `menu_items`:
```sql
ALTER TABLE menu_items
  ADD COLUMN average_rating numeric(3,1) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  ADD COLUMN review_count integer DEFAULT 0 CHECK (review_count >= 0);
```

**Pros:**
- Simpler queries (no joins needed)
- Faster to fetch menu items with ratings

**Cons:**
- Not normalized (duplicated data)
- Harder to track individual reviews
- Need triggers/functions to update aggregated values
- Less flexible for future features

## Recommended Approach: `menu_item_reviews` Table

### Schema Location
- **Database**: Back Office Supabase
- **Table**: `menu_item_reviews`

### Key Features
- One review per user per menu item (UNIQUE constraint)
- Rating: 1-5 stars
- Optional review text
- Soft delete (status field)
- RLS policies for security

### Getting Ratings for Menu Items

**Option 1: Use the View**
```sql
SELECT 
  mi.*,
  mir.review_count,
  mir.average_rating
FROM menu_items mi
LEFT JOIN menu_item_ratings mir ON mir.menu_item_id = mi.id
WHERE mi.restaurant_id = '...';
```

**Option 2: Calculate on the Fly**
```sql
SELECT 
  mi.*,
  (SELECT COUNT(*) FROM menu_item_reviews WHERE menu_item_id = mi.id AND status = 'active') as review_count,
  (SELECT ROUND(AVG(rating)::numeric, 1) FROM menu_item_reviews WHERE menu_item_id = mi.id AND status = 'active') as average_rating
FROM menu_items mi
WHERE mi.restaurant_id = '...';
```

**Option 3: Add Computed Columns to `menu_items`**
You could add a trigger that automatically updates `average_rating` and `review_count` in `menu_items` whenever a review is added/updated/deleted.

## Setup Steps

1. **Run the migration**: `migrations/create_menu_item_reviews_table.sql`
2. **Create the view** (optional): `migrations/create_menu_item_ratings_view.sql`
3. **Update your queries**: Modify `useRestaurantsBO` or create a new hook to fetch menu items with ratings

## Application Code

### Fetching Menu Items with Ratings

```javascript
// In your hook or component
const { data } = await supabase
  .from('menu_items')
  .select(`
    *,
    ratings:menu_item_ratings(
      review_count,
      average_rating
    )
  `)
  .eq('restaurant_id', restaurantId);
```

Or use the view:
```javascript
const { data } = await supabase
  .from('menu_items')
  .select(`
    *,
    ratings:menu_item_ratings!menu_item_id(
      review_count,
      average_rating
    )
  `)
  .eq('restaurant_id', restaurantId);
```

## Summary

**Best Practice**: Use `menu_item_reviews` table (separate table)
- More flexible and scalable
- Consistent with restaurant reviews pattern
- Better for tracking individual reviews

**Quick Solution**: Add `average_rating` and `review_count` columns to `menu_items`
- Simpler queries
- Faster performance
- Less flexible for future features

## MVP Recommendation

**For MVP: Skip menu item ratings entirely OR use simple columns**

### Option 1: Skip Menu Item Ratings (Recommended for MVP)
- Focus on restaurant-level reviews only
- Simpler to implement
- Can add menu item ratings later when needed
- Most users care about restaurant quality, not individual dish ratings

### Option 2: Simple Columns (If ratings are needed) ⭐ RECOMMENDED FOR MVP
- Add `average_rating` and `review_count` to `menu_items` table
- Update via application code when reviews are added
- No complex joins needed
- Fast to implement
- **Migration path available**: Can migrate to separate table later (see `migrate_from_columns_to_reviews_table.sql`)

### Option 3: Full Implementation (Only if critical for MVP)
- Use `menu_item_reviews` table
- More work upfront
- Better long-term solution
- Only do this if menu item ratings are a core MVP feature

