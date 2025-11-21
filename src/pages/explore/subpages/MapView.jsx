import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Navigation, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { useCuisineTypeEnum, useFoodCategoryEnum } from "@/hooks/useEnumValues";
import { useFilters } from "@/context/FilterContext";
import { useFilterDrawer } from "@/context/FilterDrawerContext";
import { useQueryClient } from "@tanstack/react-query";
import { states } from "@/lib/constants";
import MapContainer from "./MapContainer";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import SlideDrawer from "@/components/SlideDrawer";
import RestaurantCard from "../components/RestaurantCard";
import { cn } from "@/lib/utils";
import { calculateDistance, formatDistance } from "@/lib/calculateDistance";

export default function MapView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user);
  const {
    data: restaurants,
    isLoading: restaurantsLoading,
    error,
    refetch: refetchRestaurants,
  } = useRestaurantsBO();
  const { data: cuisineTypes } = useCuisineTypeEnum();
  const { data: foodCategories } = useFoodCategoryEnum();
  const { filters, setFilters, resetFilters } = useFilters();
  const { isOpen: isFilterDrawerOpen, closeDrawer: closeFilterDrawer } =
    useFilterDrawer();
  const queryClient = useQueryClient();

  const [priceRange, setPriceRange] = useState([0, 200]); // Min and max price
  const [minRating, setMinRating] = useState(0);
  const [userLocation, setUserLocation] = useState({
    lat: 3.139,
    lng: 101.6869,
  }); // Kuala Lumpur default
  const [isLocationReady, setIsLocationReady] = useState(false); // Track if location has been determined
  // Get radius from navigation state or default to 5
  const [searchRadius, setSearchRadius] = useState(location.state?.radius || 5);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Calculate initial drawer height (lower position to show more map)
  const headerHeight = 52;
  const bottomGap = 30;
  const initialDrawerHeight =
    typeof window !== "undefined"
      ? (window.innerHeight - headerHeight - bottomGap) * 0.45 // 45% of available space
      : 300;

  const [drawerHeight, setDrawerHeight] = useState(initialDrawerHeight); // Initial drawer height (45% of screen)
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const [selectedRestaurantFromMap, setSelectedRestaurantFromMap] =
    useState(null); // Restaurant selected from map pin
  const [pinCardImageIndex, setPinCardImageIndex] = useState({}); // Track image index for pin card
  const pinCardSwipeStartX = useRef(0);
  const pinCardSwipeStartY = useRef(0);

  // Calculate max height for drawer
  // Header is approximately 52px (pt-3 + content), bottom gap is 30px, AppNav is ~85px
  const maxDrawerHeight =
    typeof window !== "undefined"
      ? window.innerHeight - headerHeight - bottomGap // Screen height - header - bottom gap
      : 500;

  // Check if drawer is at max height (within 5px tolerance)
  const isAtMaxHeight = drawerHeight >= maxDrawerHeight - 5;

  // Update drawer height on window resize (only if it's at default height)
  useEffect(() => {
    const updateDrawerHeight = () => {
      if (typeof window !== "undefined" && !selectedRestaurantFromMap) {
        const newInitialHeight =
          (window.innerHeight - headerHeight - bottomGap) * 0.45;
        // Only update if drawer is close to initial height (within 10px tolerance)
        // This prevents resetting if user has manually dragged it
        if (Math.abs(drawerHeight - initialDrawerHeight) < 10) {
          setDrawerHeight(newInitialHeight);
        }
      }
    };

    window.addEventListener("resize", updateDrawerHeight);
    return () => window.removeEventListener("resize", updateDrawerHeight);
  }, [selectedRestaurantFromMap, drawerHeight, initialDrawerHeight]);

  // Refetch restaurants on mount to ensure fresh data on page load/refresh
  useEffect(() => {
    // Invalidate cache and refetch to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["restaurantsBO"] });
    refetchRestaurants();
  }, [queryClient, refetchRestaurants]);

  // Get user location on component mount
  useEffect(() => {
    if (profile?.current_latitude && profile?.current_longitude) {
      setUserLocation({
        lat: profile.current_latitude,
        lng: profile.current_longitude,
      });
      setIsLocationReady(true);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocationReady(true);
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Keep default KL location, but mark as ready
          setIsLocationReady(true);
        }
      );
    } else {
      // No geolocation available, use default location
      setIsLocationReady(true);
    }
  }, [profile]);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Calculate average price from menu items
  const calculateAveragePrice = (restaurant) => {
    if (!restaurant.menu_items || restaurant.menu_items.length === 0) {
      return null;
    }
    const prices = restaurant.menu_items
      .filter((item) => item.price && item.is_available !== false)
      .map((item) => parseFloat(item.price));

    if (prices.length === 0) return null;

    const average =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return Math.round(average);
  };

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return (restaurants || []).filter((restaurant) => {
    const matchesCuisine =
        !filters.cuisine || restaurant.cuisine_type === filters.cuisine;

      const matchesCategory =
        !filters.category || restaurant.food_category === filters.category;

      // Normalize location filter value (e.g., "kuala-lumpur" -> "kuala lumpur")
      const normalizedFilterLocation = filters.location
        ? filters.location.toLowerCase().replace(/-/g, " ")
        : null;

      const matchesLocation =
        !filters.location ||
        (restaurant.location &&
          restaurant.location
            .toLowerCase()
            .includes(normalizedFilterLocation)) ||
        (restaurant.vendor?.state &&
          restaurant.vendor.state.toLowerCase().replace(/-/g, " ") ===
            normalizedFilterLocation) ||
        (restaurant.vendor?.city &&
          restaurant.vendor.city
            .toLowerCase()
            .includes(normalizedFilterLocation));

      const avgPrice = calculateAveragePrice(restaurant);
      const matchesPrice =
        !avgPrice || (avgPrice >= priceRange[0] && avgPrice <= priceRange[1]);

      const matchesRating =
        !restaurant.rating || parseFloat(restaurant.rating) >= minRating;

      return (
        matchesCuisine &&
        matchesCategory &&
        matchesLocation &&
        matchesPrice &&
        matchesRating
      );
  });
  }, [
    restaurants,
    filters.cuisine,
    filters.category,
    filters.location,
    priceRange,
    minRating,
  ]);

  // Calculate nearby restaurants with distances (simplified - using coordinates from database)
  const nearbyRestaurants = useMemo(() => {
    // Don't calculate if restaurants are still loading
    if (restaurantsLoading) {
      return [];
    }

    // Don't calculate if restaurants data is not available or empty
    if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
      return [];
    }

    // Don't calculate until location is ready (prevents showing 0 results with default location)
    if (!isLocationReady) {
      return [];
    }

    // Only show restaurants if we have user location
    if (!userLocation.lat || !userLocation.lng) {
      return [];
    }

    return filteredRestaurants
      .filter((restaurant) => {
        // Only include restaurants with coordinates from database
        const restaurantLat = restaurant?.latitude;
        const restaurantLng = restaurant?.longitude;
        
        if (!restaurantLat || !restaurantLng) {
          return false;
        }

        // Calculate distance
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurantLat,
          restaurantLng
        );

        // Skip if distance calculation failed
        if (distance === null || isNaN(distance)) {
          return false;
        }

        // Filter by search radius
        return distance <= searchRadius;
      })
      .map((restaurant) => {
        const avgPrice = calculateAveragePrice(restaurant);
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.latitude,
          restaurant.longitude
        );

        return {
          ...restaurant,
          coordinates: {
            lat: restaurant.latitude,
            lng: restaurant.longitude,
          },
          averagePrice: avgPrice,
          distance: distance, // Raw distance in km
          formattedDistance: formatDistance(distance), // Formatted distance for display
        };
      });
  }, [filteredRestaurants, userLocation.lat, userLocation.lng, searchRadius, restaurants, restaurantsLoading, isLocationReady]);

  const mapRestaurants = nearbyRestaurants;

  const handleRestaurantSelect = (restaurant) => {
    navigate("/restaurant-detail", { 
      state: { 
        restaurant,
        returnPath: "/map-explore"
      } 
    });
  };

  const handleMapPinClick = (restaurant) => {
    setSelectedRestaurantFromMap(restaurant);
    // Set initial image index to 0
    setPinCardImageIndex((prev) => ({
      ...prev,
      [restaurant.id]: 0,
    }));
    // Hide the bottom drawer by setting its height to 0
    setDrawerHeight(0);
  };

  const handleClosePinCard = () => {
    setSelectedRestaurantFromMap(null);
    // Restore the bottom drawer to initial height (45% of screen)
    const currentInitialHeight =
      typeof window !== "undefined"
        ? (window.innerHeight - headerHeight - bottomGap) * 0.45
        : 300;
    setDrawerHeight(currentInitialHeight);
  };

  // Drawer drag handlers
  const handleStart = useCallback(
    (clientY) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startHeightRef.current = drawerHeight;
    },
    [drawerHeight]
  );

  const handleMove = useCallback(
    (clientY) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - clientY; // Positive when dragging up
    const minHeight = 120; // Allow dragging down to minimized state
    const newHeight = Math.max(
      minHeight,
      Math.min(maxDrawerHeight, startHeightRef.current + deltaY)
    );
    setDrawerHeight(newHeight);
    },
    [isDragging, maxDrawerHeight]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
    e.preventDefault();
    handleStart(e.clientY);
    },
    [handleStart]
  );

  const handleMouseMove = useCallback(
    (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientY);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchStart = useCallback(
    (e) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
    },
    [handleStart]
  );

  const handleTouchMove = useCallback(
    (e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.touches[0].clientY);
    },
    [isDragging, handleMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  if (profileLoading || restaurantsLoading) {
    return <LoadingComponent type="screen" text="Loading map..." />;
  }

  if (error) {
    return <ErrorComponent message={error.message} />;
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "100%", minHeight: "500px" }}
    >
      {/* Full Screen Map */}
      <div
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      >
        <MapContainer
          center={userLocation}
          restaurants={mapRestaurants}
          onRestaurantSelect={handleMapPinClick}
          radius={searchRadius}
              />
            </div>

      {/* Current Location Button */}
      <div
        className={cn(
          "absolute top-18 right-4",
          isAtMaxHeight ? "z-[4]" : "z-20"
        )}
      >
            <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-100"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-800" />
              ) : (
            <Navigation className="h-5 w-5 text-gray-800" />
              )}
            </Button>
          </div>

      {/* Slideable Bottom Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed left-0 right-0 z-[5] bg-white rounded-t-3xl shadow-2xl max-w-md mx-auto transition-all duration-300 ease-in-out",
          isDragging && "transition-none",
          isAtMaxHeight && "rounded-t-none" // Remove top border radius when at max height
        )}
        style={{
          height: `${drawerHeight}px`,
          ...(isAtMaxHeight
            ? {
                top: "52px", // Position from top when at max height (header height)
                bottom: "auto",
              }
            : {
                bottom: "30px", // Just above AppNav when not at max height
                top: "auto",
              }),
          maxHeight: `calc(100vh - 52px - 30px)`, // Screen height - header - bottom gap
          transform: drawerHeight === 0 ? "translateY(100%)" : "translateY(0)",
          opacity: drawerHeight === 0 ? 0 : 1,
          pointerEvents: drawerHeight === 0 ? "none" : "auto",
        }}
      >
        {/* Drag Handle */}
        <div
          className="w-10 h-1 bg-gray-400 rounded-full mx-auto mt-2 mb-4 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* Drawer Content */}
        <div
          className={cn(
            "px-6 h-full",
            isAtMaxHeight
              ? "overflow-y-auto no-scrollbar pb-24"
              : "overflow-hidden pb-6"
          )}
        >
                 {/* Header */}
          <div className="mb-6">
                   <h2 className="text-sm font-medium text-gray-900 text-center">
              {restaurantsLoading || profileLoading || !isLocationReady ? (
                "Loading restaurants..."
              ) : (
                <>
                  {nearbyRestaurants.length} restaurant
                  {nearbyRestaurants.length !== 1 ? "s" : ""}
                  {searchRadius <= 5 ? " nearby" : ` (within ${searchRadius} km)`}
                </>
              )}
                   </h2>
                 </div>

                 {/* Restaurant List - Full Width Cards */}
          {restaurantsLoading || profileLoading || !isLocationReady ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : nearbyRestaurants.length > 0 ? (
                   <div className="space-y-4">
              {nearbyRestaurants.slice(0, 10).map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onClick={handleRestaurantSelect}
                />
              ))}
                   </div>
                 ) : (
                   <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">
                No restaurants found within {searchRadius} km
              </p>
                   </div>
                 )}
        </div>
      </div>

      {/* Pin Click Card - Menu Items Display */}
      {selectedRestaurantFromMap && (
        <div className="fixed bottom-30 left-0 right-0 z-[6] max-w-md mx-auto pointer-events-none">
          <div className="bg-white rounded-3xl shadow-2xl pointer-events-auto mx-8">
            {/* Close Button */}
            <button
              onClick={handleClosePinCard}
              className="absolute top-4 right-12 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shadow-md"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            {/* Card Content (Map Pin) ================================================= */}
            <div className="h-[35vh]">
              {/* Top Section (2/3) - Image with Pagination */}
              <div
                // className="relative w-full flex-shrink-0"
                style={{ height: "46.67%", minHeight: "200px" }}
              >
                <div
                  className="relative w-full h-full rounded-t-3xl overflow-hidden cursor-pointer"
                  onClick={() =>
                    handleRestaurantSelect(selectedRestaurantFromMap)
                  }
                  onTouchStart={(e) => {
                    const clientX = e.touches[0].clientX;
                    const clientY = e.touches[0].clientY;
                    pinCardSwipeStartX.current = clientX;
                    pinCardSwipeStartY.current = clientY;
                  }}
                  onTouchMove={(e) => {
                    if (!pinCardSwipeStartX.current) return;
                    const clientX = e.touches[0].clientX;
                    const clientY = e.touches[0].clientY;
                    const deltaX = clientX - pinCardSwipeStartX.current;
                    const deltaY = Math.abs(
                      clientY - pinCardSwipeStartY.current
                    );

                    if (
                      Math.abs(deltaX) > Math.abs(deltaY) &&
                      Math.abs(deltaX) > 10
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (!pinCardSwipeStartX.current) return;
                    const clientX = e.changedTouches[0].clientX;
                    const deltaX = clientX - pinCardSwipeStartX.current;
                    const threshold = 50;

                    const restaurant = selectedRestaurantFromMap;
                    const currentIndex = pinCardImageIndex[restaurant.id] || 0;

                    // Get all available images with their menu item data
                    const menuItemsWithImages =
                      restaurant.menu_items
                        ?.filter((item) => item.image_url)
                        .map((item) => ({
                          image: item.image_url,
                          menuItem: item,
                          type: "menu_item",
                        })) || [];

                    const restaurantImageData = restaurant.image_url
                      ? [
                          {
                            image: restaurant.image_url,
                            menuItem: null,
                            type: "restaurant",
                          },
                        ]
                      : [];

                    const allImageData = [
                      ...restaurantImageData,
                      ...menuItemsWithImages,
                    ];
                    const imageData =
                      allImageData.length > 0
                        ? allImageData
                        : [
                            {
                              image: null,
                              menuItem: null,
                              type: "placeholder",
                            },
                          ];

                    if (Math.abs(deltaX) > threshold && imageData.length > 1) {
                      if (deltaX > 0 && currentIndex > 0) {
                        // Swipe right - previous image
                        setPinCardImageIndex((prev) => ({
                          ...prev,
                          [restaurant.id]: currentIndex - 1,
                        }));
                      } else if (
                        deltaX < 0 &&
                        currentIndex < imageData.length - 1
                      ) {
                        // Swipe left - next image
                        setPinCardImageIndex((prev) => ({
                          ...prev,
                          [restaurant.id]: currentIndex + 1,
                        }));
                      }
                    }
                    pinCardSwipeStartX.current = 0;
                    pinCardSwipeStartY.current = 0;
                  }}
                  onMouseDown={(e) => {
                    pinCardSwipeStartX.current = e.clientX;
                    pinCardSwipeStartY.current = e.clientY;
                  }}
                  onMouseMove={(e) => {
                    if (!pinCardSwipeStartX.current) return;
                    const deltaX = e.clientX - pinCardSwipeStartX.current;
                    const deltaY = Math.abs(
                      e.clientY - pinCardSwipeStartY.current
                    );

                    if (
                      Math.abs(deltaX) > Math.abs(deltaY) &&
                      Math.abs(deltaX) > 10
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!pinCardSwipeStartX.current) return;
                    const clientX = e.clientX;
                    const deltaX = clientX - pinCardSwipeStartX.current;
                    const threshold = 50;

                    const restaurant = selectedRestaurantFromMap;
                    const currentIndex = pinCardImageIndex[restaurant.id] || 0;

                    // Get all available images with their menu item data
                    const menuItemsWithImages =
                      restaurant.menu_items
                        ?.filter((item) => item.image_url)
                        .map((item) => ({
                          image: item.image_url,
                          menuItem: item,
                          type: "menu_item",
                        })) || [];

                    const restaurantImageData = restaurant.image_url
                      ? [
                          {
                            image: restaurant.image_url,
                            menuItem: null,
                            type: "restaurant",
                          },
                        ]
                      : [];

                    const allImageData = [
                      ...restaurantImageData,
                      ...menuItemsWithImages,
                    ];
                    const imageData =
                      allImageData.length > 0
                        ? allImageData
                        : [
                            {
                              image: null,
                              menuItem: null,
                              type: "placeholder",
                            },
                          ];

                    if (Math.abs(deltaX) > threshold && imageData.length > 1) {
                      if (deltaX > 0 && currentIndex > 0) {
                        setPinCardImageIndex((prev) => ({
                          ...prev,
                          [restaurant.id]: currentIndex - 1,
                        }));
                      } else if (
                        deltaX < 0 &&
                        currentIndex < imageData.length - 1
                      ) {
                        setPinCardImageIndex((prev) => ({
                          ...prev,
                          [restaurant.id]: currentIndex + 1,
                        }));
                      }
                    }
                    pinCardSwipeStartX.current = 0;
                    pinCardSwipeStartY.current = 0;
                  }}
                  onMouseLeave={() => {
                    pinCardSwipeStartX.current = 0;
                    pinCardSwipeStartY.current = 0;
                  }}
                >
                  {(() => {
                    const restaurant = selectedRestaurantFromMap;
                    const menuItemsWithImages =
                      restaurant.menu_items
                        ?.filter((item) => item.image_url)
                        .map((item) => ({
                          image: item.image_url,
                          menuItem: item,
                          type: "menu_item",
                        })) || [];

                    const restaurantImageData = restaurant.image_url
                      ? [
                          {
                            image: restaurant.image_url,
                            menuItem: null,
                            type: "restaurant",
                          },
                        ]
                      : [];

                    const allImageData = [
                      ...restaurantImageData,
                      ...menuItemsWithImages,
                    ];
                    const imageData =
                      allImageData.length > 0
                        ? allImageData
                        : [
                            {
                              image: null,
                              menuItem: null,
                              type: "placeholder",
                            },
                          ];

                    const currentIndex = pinCardImageIndex[restaurant.id] || 0;
                    const currentImageData = imageData[currentIndex];
                    const currentMenuItem = currentImageData?.menuItem;

                    return (
                      <>
                        <div className="relative w-full h-full">
                          {imageData.map((item, index) => (
                            <div
                              key={index}
                              className={`absolute inset-0 transition-opacity duration-300 ${
                                index === currentIndex
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={
                                    item.menuItem
                                      ? item.menuItem.name
                                      : `${restaurant.name} - Image ${
                                          index + 1
                                        }`
                                  }
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-2xl">
                                    🍽️
                                  </span>
          </div>
                              )}
        </div>
                          ))}
                        </div>
                        {/* Menu Item Info Overlay */}
                        {currentMenuItem && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4">
                            {/* <div className="text-white flex gap-4">
                              <h3 className="text-sm font-semibold line-clamp-1">
                                {currentMenuItem.name}
                              </h3>
                              <div className="flex items-center justify-start">
                                <span className="text-sm font-semibold">
                                  RM
                                  {parseFloat(
                                    currentMenuItem.price || 0
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div> */}
                          </div>
                        )}

                        {/* Dot Pagination */}
                        {imageData.length > 1 && (
                          <div
                            className="absolute left-1/2 transform -translate-x-1/2 flex gap-1.5 bottom-3
                            "
                          >
                            {imageData.map((_, index) => (
                              <button
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  index === currentIndex
                                    ? "bg-white w-4"
                                    : "bg-white/50"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPinCardImageIndex((prev) => ({
                                    ...prev,
                                    [restaurant.id]: index,
                                  }));
                                }}
          />
                            ))}
        </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Bottom Section (1/3) - Information */}
              <div
                className="w-full flex-shrink-0 pt-4 px-4"
                style={{ height: "33.33%", minHeight: "100px" }}
              >
                <div className="h-full flex flex-col justify-start">
                  {(() => {
                    const restaurant = selectedRestaurantFromMap;
                    const menuItemsWithImages =
                      restaurant.menu_items
                        ?.filter((item) => item.image_url)
                        .map((item) => ({
                          image: item.image_url,
                          menuItem: item,
                          type: "menu_item",
                        })) || [];

                    const restaurantImageData = restaurant.image_url
                      ? [
                          {
                            image: restaurant.image_url,
                            menuItem: null,
                            type: "restaurant",
                          },
                        ]
                      : [];

                    const allImageData = [
                      ...restaurantImageData,
                      ...menuItemsWithImages,
                    ];
                    const imageData =
                      allImageData.length > 0
                        ? allImageData
                        : [
                            {
                              image: null,
                              menuItem: null,
                              type: "placeholder",
                            },
                          ];

                    const currentIndex = pinCardImageIndex[restaurant.id] || 0;
                    const currentImageData = imageData[currentIndex];
                    const currentMenuItem = currentImageData?.menuItem;

                    return (
                      <>
                        {/* Restaurant Name with Rating Inline */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-black line-clamp-2 flex-1">
                            {restaurant.name || "Restaurant"}
                          </p>
                          {/* Rating - Always show, default to 0 */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-3 h-3 fill-black text-black" />
                            <span className="text-sm font-medium text-black">
                              {parseFloat(restaurant.rating || 0).toFixed(1)}
              </span>
            </div>
                        </div>

                        {/* Additional Info - Hide when menu item is showing */}
                        {!currentMenuItem && (
                          <p className="text-xs text-gray-500 line-clamp-1 mt-2">
                            {(() => {
                              const parts = [];

                              // Cuisine type
                              if (restaurant.cuisine_type) {
                                parts.push(restaurant.cuisine_type);
                              }

                              // Food category
                              if (
                                restaurant.food_category &&
                                restaurant.food_category !== "All"
                              ) {
                                parts.push(restaurant.food_category);
                              }

                              // Distance
                              if (restaurant.formattedDistance) {
                                parts.push(
                                  `${restaurant.formattedDistance} away`
                                );
                              }

                              return parts.length > 0 ? parts.join(" · ") : "";
                            })()}
                          </p>
                        )}

                        {/* Current Menu Item Info */}
                        {currentMenuItem && (
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-sm font-medium text-black line-clamp-1 flex-1">
                                {currentMenuItem.name}
                              </h3>
                              <span className="text-sm font-semibold text-black whitespace-nowrap">
                                RM
                                {parseFloat(currentMenuItem.price || 0).toFixed(
                                  2
                                )}
            </span>
          </div>
                            {currentMenuItem.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {currentMenuItem.description}
                              </p>
                            )}
        </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Drawer */}
      <SlideDrawer
        open={isFilterDrawerOpen}
        onClose={closeFilterDrawer}
        title="Filters"
        direction="bottom"
        showBackButton={false}
        zIndex={{ overlay: 49, drawer: 50 }}
        bottomSection={
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            <Button
              variant="ghost"
              onClick={() => {
                resetFilters();
                setPriceRange([0, 200]);
                setMinRating(0);
                setSearchRadius(5);
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Clear all
            </Button>
            <Button
              onClick={closeFilterDrawer}
              className="bg-black text-white hover:bg-gray-800 rounded-lg px-6"
            >
              Show {nearbyRestaurants.length} restaurants
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-6">
          {/* Cuisine Type Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Type of cuisine
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!filters.cuisine ? "default" : "outline"}
                className={cn(
                  "rounded-full",
                  !filters.cuisine
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, cuisine: null }))
                }
              >
                Any type
              </Button>
              {cuisineTypes?.map((cuisine) => (
                <Button
                  key={cuisine.value}
                  variant={
                    filters.cuisine === cuisine.value ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full",
                    filters.cuisine === cuisine.value
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      cuisine: cuisine.value,
                    }))
                  }
                >
                  {cuisine.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Food Category Section */}
          {foodCategories && foodCategories.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Recommended for you
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {foodCategories.slice(0, 3).map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      filters.category === category.value
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-24 flex flex-col items-center justify-center gap-2 rounded-xl",
                      filters.category === category.value
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        category:
                          filters.category === category.value
                            ? null
                            : category.value,
                      }))
                    }
                  >
                    <span className="text-2xl">
                      {category.value === "Halal" && "🕌"}
                      {category.value === "Vegetarian" && "🥗"}
                      {category.value === "Vegan" && "🌱"}
                      {category.value === "Gluten-Free" && "🌾"}
                      {![
                        "Halal",
                        "Vegetarian",
                        "Vegan",
                        "Gluten-Free",
                      ].includes(category.value) && "🍽️"}
            </span>
                    <span className="text-xs font-medium">
                      {category.label}
                    </span>
                  </Button>
                ))}
          </div>
            </div>
          )}

          {/* Price Range Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Price range
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Average meal price, includes all items
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">
                    Minimum
                  </label>
                  <div className="text-sm font-semibold text-gray-900">
                    RM{priceRange[0].toFixed(2)}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">
                    Maximum
                  </label>
                  <div className="text-sm font-semibold text-gray-900">
                    RM{priceRange[1].toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="relative h-2">
                <style>{`
                      input[type="range"] {
                        -webkit-appearance: none;
                        appearance: none;
                        background: transparent;
                        cursor: pointer;
                      }
                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: white;
                        border: 2px solid #000;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                      input[type="range"]::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: white;
                        border: 2px solid #000;
                        cursor: pointer;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                      }
                    `}</style>
                {/* Background track */}
                <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
                {/* Active range */}
                <div
                  className="absolute h-2 bg-black rounded-lg"
                  style={{
                    left: `${(priceRange[0] / 200) * 100}%`,
                    width: `${((priceRange[1] - priceRange[0]) / 200) * 100}%`,
                  }}
                ></div>
                {/* Min slider */}
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value);
                    if (newMin <= priceRange[1]) {
                      setPriceRange([newMin, priceRange[1]]);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
                />
                {/* Max slider */}
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    if (newMax >= priceRange[0]) {
                      setPriceRange([priceRange[0], newMax]);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-20"
                />
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Minimum rating
            </h3>
            <div className="flex flex-wrap gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={minRating === rating ? "default" : "outline"}
                  className={cn(
                    "rounded-full",
                    minRating === rating
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => setMinRating(rating)}
                >
                  {rating === 0 ? "Any rating" : `${rating}+ Stars`}
                </Button>
          ))}
        </div>
          </div>

          {/* Search Radius Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Search radius
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Distance from your location
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="text-lg font-semibold text-gray-900">
                  {searchRadius} km
                </div>
              </div>
              <div className="relative h-2">
                <style>{`
                  input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    background: transparent;
                    cursor: pointer;
                  }
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #000;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  input[type="range"]::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: white;
                    border: 2px solid #000;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                `}</style>
                {/* Background track */}
                <div className="absolute w-full h-2 bg-gray-200 rounded-lg"></div>
                {/* Active range */}
                <div
                  className="absolute h-2 bg-black rounded-lg"
                  style={{
                    width: `${(searchRadius / 30) * 100}%`,
                  }}
                ></div>
                {/* Radius slider */}
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={searchRadius}
                  onChange={(e) => {
                    setSearchRadius(Number(e.target.value));
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
          />
        </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>30 km</span>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Location
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!filters.location ? "default" : "outline"}
                className={cn(
                  "rounded-full",
                  !filters.location
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, location: null }))
                }
              >
                Any location
              </Button>
              {states.map((state) => (
                <Button
                  key={state.value}
                  variant={
                    filters.location === state.value ? "default" : "outline"
                  }
                  className={cn(
                    "rounded-full",
                    filters.location === state.value
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      location: state.value,
                    }))
                  }
                >
                  {state.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SlideDrawer>
    </div>
  );
}
