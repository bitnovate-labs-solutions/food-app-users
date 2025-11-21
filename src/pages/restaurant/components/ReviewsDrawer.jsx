import SlideDrawer from "@/components/SlideDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, Award, X } from "lucide-react";
import { useState } from "react";
import * as React from "react";
import { useRestaurantReviews } from "@/hooks/useRestaurantReviews";

export default function ReviewsDrawer({
  open,
  onClose,
  restaurant,
  rating,
  reviewCount,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Most relevant");
  const [isHowReviewsWorkOpen, setIsHowReviewsWorkOpen] = useState(false);

  // Fetch reviews from database
  const { data: reviewsData, isLoading } = useRestaurantReviews(restaurant?.id);

  const reviews = reviewsData?.reviews || [];
  const ratingBreakdown = reviewsData?.ratingBreakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = reviewsData?.totalReviews || 0;

  // Filter and sort reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    // First, filter by search query
    let filtered = reviews.filter(
      (review) =>
        review.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then, sort based on sortBy value
    switch (sortBy) {
      case "Newest first":
        filtered = [...filtered].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at); // Newest first
        });
        break;
      case "Oldest first":
        filtered = [...filtered].sort((a, b) => {
          return new Date(a.created_at) - new Date(b.created_at); // Oldest first
        });
        break;
      case "Highest rated":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case "Lowest rated":
        filtered = [...filtered].sort((a, b) => a.rating - b.rating);
        break;
      case "Most relevant":
      default:
        // Sort by helpful_count (descending) then by created_at (descending)
        filtered = [...filtered].sort((a, b) => {
          if (b.helpfulCount !== a.helpfulCount) {
            return b.helpfulCount - a.helpfulCount;
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        break;
    }

    return filtered;
  }, [reviews, searchQuery, sortBy]);

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="Reviews"
      direction="right"
      zIndex={{ overlay: 150, drawer: 151 }}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Overall Rating Section */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-6xl font-semibold text-black mb-4">
              {rating}
            </span>
          </div>

          <p className="text-xs text-gray-500 text-center px-8">
            This restaurant is a guest favourite based on ratings, reviews and
            reliability.
          </p>
        </div>

        {/* Rating Breakdown */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-black mb-4">
              Overall rating
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingBreakdown[stars] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-8">{stars}</span>
                    <Star className="w-3 h-3 fill-black text-black" />
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-black">
                {reviewCount} reviews
              </h3>
              <button
                onClick={() => setIsHowReviewsWorkOpen(true)}
                className="text-xs text-gray-600 underline mt-1 hover:text-gray-800 transition-colors"
              >
                How reviews work
              </button>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search all reviews"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-9 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9 text-xs border-gray-300 focus-visible:border-gray-300 focus-visible:ring-2 focus-visible:ring-black rounded-lg">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent
                className="z-[300] bg-white border-gray-300 text-xs"
                position="popper"
                style={{ zIndex: 300 }}
              >
                <SelectItem
                  value="Most relevant"
                  className="text-xs text-gray-700 hover:bg-gray-50 focus:bg-gray-50 px-4 py-3"
                >
                  Most relevant
                </SelectItem>
                <SelectItem
                  value="Newest first"
                  className="text-xs text-gray-700 hover:bg-gray-50 focus:bg-gray-50 px-4 py-3"
                >
                  Newest first
                </SelectItem>
                <SelectItem
                  value="Oldest first"
                  className="text-xs text-gray-700 hover:bg-gray-50 focus:bg-gray-50 px-4 py-3"
                >
                  Oldest first
                </SelectItem>
                <SelectItem
                  value="Highest rated"
                  className="text-xs text-gray-700 hover:bg-gray-50 focus:bg-gray-50 px-4 py-3"
                >
                  Highest rated
                </SelectItem>
                <SelectItem
                  value="Lowest rated"
                  className="text-xs text-gray-700 hover:bg-gray-50 focus:bg-gray-50 px-4 py-3"
                >
                  Lowest rated
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">Loading reviews...</p>
            </div>
          ) : filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-600">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-black">
                        {review.userName}
                      </span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating
                              ? "fill-black text-black"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-gray-700 leading-relaxed">
                  {review.reviewText}
                </p>
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">
                No reviews found matching your search.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">
                No reviews yet. Be the first to review this restaurant!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How Reviews Work Bottom Drawer */}
      <SlideDrawer
        open={isHowReviewsWorkOpen}
        onClose={() => setIsHowReviewsWorkOpen(false)}
        direction="bottom"
        zIndex={{ overlay: 200, drawer: 201 }}
        showHeader={false}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-md font-semibold text-black">
              How reviews work
            </h2>
            <button
              onClick={() => setIsHowReviewsWorkOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed mb-10">
            <p>
              Reviews from past diners help our community learn more about each
              restaurant. By default, reviews are sorted by relevance based on
              recency, length, and helpfulness.
            </p>

            <p>
              Only customers who have dined at the restaurant can leave a
              review. We moderate reviews to ensure they follow our community
              guidelines and provide accurate information.
            </p>

            <p>
              To be eligible for ratings and guest favourite labels, restaurants
              need at least 5 reviews. Our review criteria are designed to help
              you make informed dining decisions.
            </p>
          </div>
        </div>
      </SlideDrawer>
    </SlideDrawer>
  );
}
