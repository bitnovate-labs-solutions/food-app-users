// FETCH REVIEWS FROM BACK OFFICE DATABASE
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchRestaurantReviews = async (restaurantId) => {
  if (!restaurantId) return { reviews: [], ratingBreakdown: {}, averageRating: 0, totalReviews: 0 };

  // Fetch reviews from back office database
  const { data: reviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (reviewsError) {
    console.error("❌ Error fetching reviews:", reviewsError);
    throw new Error("Failed to load reviews");
  }

  // Get unique user IDs from reviews
  const userIds = [...new Set(reviews.map((r) => r.user_id))];

  // Fetch user profiles from profiles table (since reviews.user_id references profiles.id)
  let userProfiles = {};
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, display_name, profile_image_url")
      .in("id", userIds);

    if (usersError) {
      console.error("❌ Error fetching user profiles:", usersError);
    } else {
      // Create a map of user_id -> user profile
      userProfiles = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
    }
  }

  // Combine reviews with user profiles
  const enrichedReviews = reviews.map((review) => {
    const userProfile = userProfiles[review.user_id] || {};
    return {
      id: review.id,
      user_id: review.user_id,
      userName: userProfile.display_name || "Anonymous",
      userAvatar: userProfile.profile_image_url || null,
      rating: review.rating,
      reviewText: review.review_text,
      helpfulCount: review.helpful_count || 0,
      created_at: review.created_at,
      // Format date as "Month YYYY"
      date: new Date(review.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  });

  // Calculate rating breakdown
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
  });

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return {
    reviews: enrichedReviews,
    ratingBreakdown,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    totalReviews: reviews.length,
  };
};

export const useRestaurantReviews = (restaurantId) => {
  return useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: () => fetchRestaurantReviews(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

