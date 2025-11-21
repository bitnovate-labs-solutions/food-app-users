# Reviews and Ratings Table Setup Guide

## Database Location

The `reviews` table should be created in the **BACK OFFICE Supabase database** because:

1. **Restaurant-related data**: Reviews are fundamentally about restaurants, their services, and food quality
2. **Data locality**: All restaurant-related data (restaurants, menu_items, reviews) should be in one place
3. **Vendor access**: Vendors need to view and potentially respond to reviews of their restaurants
4. **Query efficiency**: When fetching restaurant details, reviews can be fetched from the same database
5. **Logical grouping**: Reviews are part of the restaurant's data, not the user's data

**Industry Best Practice**: This follows the common pattern used by platforms like:
- **E-commerce** (Amazon, eBay): Product reviews stored with products
- **Restaurant platforms** (Yelp, TripAdvisor): Reviews stored with restaurants
- **Hotel platforms** (Booking.com, Airbnb): Reviews stored with hotels/listings

## Schema Design

### Table: `reviews`

**Location**: Back Office Supabase database

**Key Fields**:
- `id`: Primary key (UUID)
- `user_id`: UUID reference to user in main database (no FK constraint since it's a separate database)
- `restaurant_id`: References `restaurants(id)` - the restaurant being reviewed (FK constraint, same database)
- `rating`: Integer (1-5 stars)
- `review_text`: The actual review content
- `helpful_count`: For relevance sorting
- `status`: 'active', 'deleted', 'flagged', 'hidden'
- `created_at`, `updated_at`: Timestamps

**Constraints**:
- One review per user per restaurant (enforced by UNIQUE constraint)
- Rating must be between 1 and 5
- Soft delete (status = 'deleted') instead of hard delete
- Foreign key constraint on `restaurant_id` (same database)

## Relationship to Restaurants

Since `restaurants` are in the **same database**, we:
- Use a proper foreign key constraint on `restaurant_id`
- Can join reviews with restaurants efficiently in SQL
- Can use RLS policies that check restaurant status
- Can cascade delete reviews when a restaurant is deleted

## Relationship to Users

Since `users` are in the **main database** (separate Supabase project), we:
- Store `user_id` as a UUID only (no FK constraint)
- Must validate user existence in application code
- Need to fetch user profile data (name, avatar) from main database when displaying reviews
- Can use `auth.uid()` in RLS policies to match `user_id` for authenticated users

## RLS Policies

1. **Public can view active reviews for active restaurants**: Anyone can see active reviews, but only for active restaurants
2. **Authenticated users can view all active reviews**: Logged-in users can see all active reviews
3. **Users can create their own reviews**: Authenticated users can create reviews for active restaurants
4. **Users can update their own reviews**: Users can edit their reviews
5. **Users can delete their own reviews**: Users can soft-delete their reviews
6. **Vendors can view reviews for their restaurants**: Restaurant owners can see all reviews for their restaurants

## Indexes

Optimized for common queries:
- Finding reviews by restaurant (most common)
- Finding reviews by user
- Sorting by date, rating, helpfulness
- Filtering by status

## Future Enhancements

Optional fields that can be added later:
- `cleanliness_rating`, `accuracy_rating`, `value_rating` (category ratings)
- `images` (array of image URLs)
- `response_text` (restaurant owner response)
- `response_created_at` (when restaurant responded)

## Usage in Application

When fetching reviews from back office database:
1. Query `reviews` table from back office database
2. Join with `restaurants` table (same database) for restaurant info
3. Use `user_id` to fetch user profile data from main database (app_users table)
4. Calculate rating breakdowns and averages in application code

### Example Query Pattern

```javascript
// Fetch reviews from back office database
const { data: reviews } = await supabase
  .from('reviews')
  .select('*, restaurant:restaurants(*)')
  .eq('restaurant_id', restaurantId)
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Then fetch user profiles from main database
const userIds = reviews.map(r => r.user_id);
const { data: users } = await supabase
  .from('app_users')
  .select('id, display_name, profile_image_url')
  .in('auth_user_id', userIds);

// Combine the data in your application code
```

