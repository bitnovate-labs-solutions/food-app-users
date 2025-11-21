import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Star, ChevronRight, Home as HomeIcon, Map } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/lib/calculateDistance";
import ExploreModal from "@/pages/home/subpages/restaurants/components/ExploreModal";

export default function RecommendedSpot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user);
  const { data: restaurants } = useRestaurantsBO();
  const [popularCarouselIndex, setPopularCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSwipeRef = useRef(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const isFilteringRef = useRef(false);

  // Memoize restaurants to prevent unnecessary re-renders
  const restaurantsWithItems = useMemo(() => {
    return restaurants || [];
  }, [restaurants]);

  const popularRestaurants = useMemo(() => {
    return restaurantsWithItems.slice(0, 8);
  }, [restaurantsWithItems]);

  // Filter restaurants within MAX_DISTANCE_KM of user's location
  useEffect(() => {
    // Prevent multiple simultaneous filter operations
    if (isFilteringRef.current) return;

    const filterNearbyRestaurants = async () => {
      try {
        if (!restaurantsWithItems.length || !profile) {
          setNearbyRestaurants([]);
          isFilteringRef.current = false;
          return;
        }

        const userLat = profile?.current_latitude;
        const userLng = profile?.current_longitude;

        // Need user location to filter
        if (!userLat || !userLng) {
          setNearbyRestaurants([]);
          isFilteringRef.current = false;
          return;
        }

        const MAX_DISTANCE_KM = 10;
        const nearby = [];

        // Process all restaurants to find nearby ones
        for (const restaurant of restaurantsWithItems) {
          try {
            const restaurantLat = restaurant?.latitude;
            const restaurantLng = restaurant?.longitude;

            // Skip restaurants without coordinates
            if (!restaurantLat || !restaurantLng) {
              continue;
            }

            // Calculate distance
            const distance = calculateDistance(
              Number(userLat),
              Number(userLng),
              Number(restaurantLat),
              Number(restaurantLng)
            );

            if (
              distance !== null &&
              !isNaN(distance) &&
              distance <= MAX_DISTANCE_KM
            ) {
              nearby.push({ restaurant, distance });
            }
          } catch (error) {
            console.error(`Error processing ${restaurant.name}:`, error);
            // Continue with next restaurant even if this one fails
          }
        }

        // Sort by distance and map to restaurants
        const sortedNearby = nearby
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10) // Limit to 10 closest
          .map((item) => item.restaurant);

        setNearbyRestaurants(sortedNearby);
      } catch (error) {
        console.error("Error filtering nearby restaurants:", error);
        setNearbyRestaurants([]);
      } finally {
        isFilteringRef.current = false;
      }
    };

    isFilteringRef.current = true;
    filterNearbyRestaurants();
  }, [restaurantsWithItems, profile]);

  // Show 1 item at a time, 8 total slides
  const totalSlides = popularRestaurants.length;

  // Auto-swipe functionality
  useEffect(() => {
    if (totalSlides === 0 || isPaused) return;

    autoSwipeRef.current = setInterval(() => {
      setPopularCarouselIndex((prev) => (prev + 1) % totalSlides);
    }, 3000); // Auto-advance every 3 seconds

    return () => {
      if (autoSwipeRef.current) {
        clearInterval(autoSwipeRef.current);
      }
    };
  }, [totalSlides, isPaused]);

  const getVisibleRestaurants = () => {
    return [popularRestaurants[popularCarouselIndex]].filter(Boolean);
  };

  const handleIndicatorClick = (index) => {
    setPopularCarouselIndex(index);
    // Pause auto-swipe briefly when manually navigating
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div className="px-6 space-y-5 pb-6">
      {/* Search Button ========================================================= */}
      <button
        onClick={() => setIsExploreModalOpen(true)}
        className="w-full flex justify-center items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full transition-colors text-center drop-shadow-lg"
      >
        <Map className="w-4 h-4 text-gray-700 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700">Explore</span>
      </button>

      {/* Popular Restaurants Section ========================================================= */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-black">
            Featured Food & Places
          </h2>
        </div>
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex justify-center overflow-hidden">
            {getVisibleRestaurants().map((restaurant) => {
              const firstImage =
                restaurant.menu_items?.[0]?.image_url || restaurant.image_url;
              return (
                <div
                  key={restaurant.id}
                  className="flex-shrink-0 w-full cursor-pointer"
                  onClick={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const firstImage =
                      restaurant.menu_items?.[0]?.image_url ||
                      restaurant.image_url;

                    navigate("/restaurant-detail", {
                      state: {
                        restaurant,
                        returnPath: "/home?tab=restaurants",
                        imageTransition: {
                          src: firstImage,
                          x: rect.left,
                          y: rect.top,
                          width: rect.width,
                          height: rect.height,
                        },
                      },
                    });
                  }}
                >
                  <div className="relative w-full h-45 rounded-3xl overflow-hidden">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <HomeIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full flex items-center">
                      <span className="text-[10px] font-medium text-black">
                        Guest favourite
                      </span>
                    </div>
                    <button
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                    >
                      <Heart className="w-3 h-3 text-black" />
                    </button>

                    {/* Bottom Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-semibold text-white line-clamp-1 flex-1 pr-2">
                          {restaurant.name || "Restaurant"}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-white text-white" />
                          <span className="text-sm font-medium text-white">
                            {restaurant.rating?.toFixed(2) || "New"}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">
                        RM{restaurant.menu_items?.[0]?.price || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Carousel Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === popularCarouselIndex
                    ? "w-6 bg-black"
                    : "w-1.5 bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Restaurants Section ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-black">
              Available nearby
            </h2>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
        {nearbyRestaurants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No restaurants nearby</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
            {nearbyRestaurants.map((restaurant) => {
              const firstImage =
                restaurant.menu_items?.[0]?.image_url || restaurant.image_url;
              return (
                <div
                  key={restaurant.id}
                  className="flex-shrink-0 w-48 cursor-pointer"
                  onClick={(e) => {
                    const card = e.currentTarget;
                    const rect = card.getBoundingClientRect();
                    const firstImage =
                      restaurant.menu_items?.[0]?.image_url ||
                      restaurant.image_url;

                    navigate("/restaurant-detail", {
                      state: {
                        restaurant,
                        returnPath: "/home?tab=restaurants",
                        imageTransition: {
                          src: firstImage,
                          x: rect.left,
                          y: rect.top,
                          width: rect.width,
                          height: rect.height,
                        },
                      },
                    });
                  }}
                >
                  <div className="relative">
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <HomeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full flex items-center">
                        <span className="text-[10px] font-medium text-black">
                          Guest favourite
                        </span>
                      </div>
                      <button className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Heart className="w-3 h-3 text-black" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-[12px] text-black font-medium mb-1 line-clamp-1">
                        {restaurant.name || "Restaurant"}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-gray-500 font-light">
                          RM{restaurant.menu_items?.[0]?.price || "N/A"}
                        </p>
                        <div className="flex items-center gap-1 mr-1">
                          <Star className="w-3 h-3 fill-gray-500 text-gray-500" />
                          <span className="text-[12px] font-light text-gray-500">
                            {restaurant.rating?.toFixed(2) || "New"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explore Modal ========================================================= */}
      <ExploreModal
        open={isExploreModalOpen}
        onOpenChange={setIsExploreModalOpen}
      />
    </div>
  );
}

