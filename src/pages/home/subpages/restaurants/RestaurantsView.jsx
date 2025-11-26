import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ChevronRight,
  Home as HomeIcon,
  Map,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { usePromotions } from "@/hooks/usePromotions";
import { useAuth } from "@/context/AuthContext";
import { calculateDistance } from "@/lib/calculateDistance";
import { supabase } from "@/lib/supabase";
import { addCacheBuster } from "@/utils/addCacheBuster";
import SlideDrawer from "@/components/SlideDrawer";
import { Button } from "@/components/ui/button";
import ExploreModal from "./components/ExploreModal";

export default function RestaurantsView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useUserProfile(user);
  const { data: restaurants } = useRestaurantsBO();
  const { data: promotions } = usePromotions();
  const [promotionCarouselIndex, setPromotionCarouselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSwipeRef = useRef(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [isPromotionDrawerOpen, setIsPromotionDrawerOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const isFilteringRef = useRef(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const touchStartY = useRef(null);

  // Memoize restaurants to prevent unnecessary re-renders
  const restaurantsWithItems = useMemo(() => {
    return restaurants || [];
  }, [restaurants]);

  // Get promotion image URL (similar to vouchers)
  const getPromotionImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    // If it's already a full URL, return it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return addCacheBuster(imageUrl);
    }

    // Otherwise, construct URL from storage bucket (assuming "promotion-images" bucket)
    const {
      data: { publicUrl },
    } = supabase.storage.from("promotion-images").getPublicUrl(imageUrl);

    return addCacheBuster(publicUrl);
  };

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

  // Show 1 promotion at a time
  const totalSlides = promotions?.length || 0;

  // Auto-swipe functionality
  useEffect(() => {
    if (totalSlides === 0 || isPaused) return;

    autoSwipeRef.current = setInterval(() => {
      setPromotionCarouselIndex((prev) => (prev + 1) % totalSlides);
    }, 3000); // Auto-advance every 3 seconds

    return () => {
      if (autoSwipeRef.current) {
        clearInterval(autoSwipeRef.current);
      }
    };
  }, [totalSlides, isPaused]);

  const getVisiblePromotions = () => {
    if (!promotions || promotions.length === 0) return [];
    return [promotions[promotionCarouselIndex]].filter(Boolean);
  };

  const handleIndicatorClick = (index) => {
    setPromotionCarouselIndex(index);
    // Pause auto-swipe briefly when manually navigating
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    // Prevent vertical scrolling when swiping horizontally
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - go to next slide
        setPromotionCarouselIndex((prev) => (prev + 1) % totalSlides);
      } else {
        // Swipe right - go to previous slide
        setPromotionCarouselIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
      }
      // Pause auto-swipe briefly when manually swiping
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000);
    }

    // Reset touch positions
    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="px-6 space-y-5 pb-24">
      {/* Search Button - Fixed at top ========================================================= */}
      <div className="fixed top-25 left-0 right-0 z-[9] py-4 px-6 max-w-md mx-auto">
        <button
          onClick={() => setIsExploreModalOpen(true)}
          className="w-full flex justify-center items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-full transition-colors text-center drop-shadow-lg"
        >
          <Map className="w-4 h-4 text-gray-700 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700">Explore</span>
        </button>
      </div>

      {/* Promotions Section ========================================================= */}
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-black">
            Featured Food & Places
          </h2>
        </div>
        {totalSlides === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No promotions available</p>
          </div>
        ) : (
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-center overflow-hidden">
              {getVisiblePromotions().map((promotion) => {
                const promotionImageUrl = getPromotionImageUrl(
                  promotion.image_url
                );
                return (
                  <div
                    key={promotion.id}
                    className="flex-shrink-0 w-full cursor-pointer transition-transform duration-300 ease-in-out"
                    onClick={() => {
                      setSelectedPromotion(promotion);
                      setIsPromotionDrawerOpen(true);
                    }}
                  >
                    <div className="relative w-full h-45 rounded-3xl overflow-hidden">
                      {promotionImageUrl ? (
                        <img
                          src={promotionImageUrl}
                          alt={promotion.title || "Promotion"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback =
                              e.target.parentElement?.querySelector(
                                ".promotion-fallback"
                              );
                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

                      {/* Bottom Content Overlay ======= CODE FOR FUTURE USE ========= */}
                      {/* {(promotion.title || promotion.description) && (
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {promotion.title && (
                            <h3 className="text-base font-semibold text-white line-clamp-1 mb-1">
                              {promotion.title}
                            </h3>
                          )}
                          {promotion.description && (
                            <p className="text-sm text-white/90 line-clamp-2">
                              {promotion.description}
                            </p>
                          )}
                        </div>
                      )} */}

                      {/* Fallback for image error */}
                      <div className="promotion-fallback hidden w-full h-full bg-gray-200 items-center justify-center absolute inset-0">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
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
                    index === promotionCarouselIndex
                      ? "w-6 bg-black"
                      : "w-1.5 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
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

      {/* Promotion Detail Drawer */}
      <SlideDrawer
        open={isPromotionDrawerOpen}
        onClose={() => {
          setIsPromotionDrawerOpen(false);
          setSelectedPromotion(null);
        }}
        title={selectedPromotion?.title || "Promotion"}
        direction="bottom"
        zIndex={{ overlay: 59, drawer: 60 }}
        showBackButton={true}
        bottomSection={
          selectedPromotion?.target_restaurant_id && (
            <div className="p-4 bg-white border-t border-gray-200">
              <Button
                onClick={() => {
                  const restaurant = restaurantsWithItems.find(
                    (r) => r.id === selectedPromotion.target_restaurant_id
                  );
                  if (restaurant) {
                    setIsPromotionDrawerOpen(false);
                    setSelectedPromotion(null);
                    navigate("/restaurant-detail", {
                      state: {
                        restaurant,
                        returnPath: "/home?tab=restaurants",
                      },
                    });
                  }
                }}
                className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl font-medium"
              >
                View Restaurant
              </Button>
            </div>
          )
        }
      >
        {selectedPromotion && (
          <div className="flex flex-col h-full">
            {/* Image Section */}
            <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
              {getPromotionImageUrl(selectedPromotion.image_url) ? (
                <img
                  src={getPromotionImageUrl(selectedPromotion.image_url)}
                  alt={selectedPromotion.title || "Promotion"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    const fallback = e.target.parentElement?.querySelector(
                      ".promotion-drawer-fallback"
                    );
                    if (fallback) {
                      fallback.style.display = "flex";
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              {/* Fallback for image error */}
              <div className="promotion-drawer-fallback hidden w-full h-full bg-gray-100 items-center justify-center absolute inset-0">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            </div>

            {/* Promotion Details Section */}
            <div className="flex-1 bg-white px-6 py-6 space-y-4 overflow-y-auto">
              {/* Title */}
              {selectedPromotion.title && (
                <div>
                  <h2 className="text-xl font-bold text-black mb-2">
                    {selectedPromotion.title}
                  </h2>
                </div>
              )}

              {/* Description */}
              {selectedPromotion.description && (
                <div>
                  <p className="text-sm font-bold text-black mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedPromotion.description}
                  </p>
                </div>
              )}

              {/* Date Range */}
              {(selectedPromotion.start_date || selectedPromotion.end_date) && (
                <div>
                  <p className="text-sm font-bold text-black mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Validity
                  </p>
                  <div className="text-sm text-gray-700">
                    {selectedPromotion.start_date && (
                      <p>
                        Start:{" "}
                        {new Date(selectedPromotion.start_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                    {selectedPromotion.end_date && (
                      <p>
                        End:{" "}
                        {new Date(selectedPromotion.end_date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
