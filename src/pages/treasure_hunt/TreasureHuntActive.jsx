import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Clock,
  CheckCircle2,
  ChevronDown,
  QrCode,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import LowPolyScene from "./components/LowPolyScene";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { calculateDistance } from "@/lib/calculateDistance";
import { geocodeAddressWithCache } from "@/lib/geocodeAddress";
import chestImage from "@/assets/images/chest.png";

export default function TreasureHuntActive({
  location: propLocation,
  onClearActiveHunt,
}) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user);
  const {
    data: restaurants,
    isLoading: restaurantsLoading,
    error,
  } = useRestaurantsBO();

  // Use prop location if provided (for embedded use), otherwise use router location
  const location = propLocation || routerLocation;

  // Get data from navigation state
  const { selectedLevel, formData, mode: initialMode } = location.state || {};

  const [mode, setMode] = useState(initialMode || "solo"); // "solo" or "team"
  
  // Update mode when location state changes (e.g., when coming back from Invite Friends)
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Save mode to localStorage when it changes
  useEffect(() => {
    const storedHunt = localStorage.getItem("activeTreasureHunt");
    if (storedHunt) {
      try {
        const huntData = JSON.parse(storedHunt);
        huntData.mode = mode;
        huntData.returnMode = mode; // Also update returnMode for consistency
        localStorage.setItem("activeTreasureHunt", JSON.stringify(huntData));
      } catch (error) {
        console.error("Error updating active hunt mode:", error);
      }
    }
  }, [mode]);
  const [drawerHeight, setDrawerHeight] = useState(0); // Dynamic height in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: 3.139,
    lng: 101.6869,
  }); // Kuala Lumpur default
  const [isLocationReady, setIsLocationReady] = useState(false);
  
  // Refs for drag handling
  const drawerRef = useRef(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const hasMovedRef = useRef(false);
  
  // Calculate max height for drawer (30vh default, but can go up to ~70vh)
  const maxDrawerHeight = typeof window !== "undefined"
    ? window.innerHeight * 0.7
    : 500;
  const minDrawerHeight = 32; // Minimum height when collapsed (just the drag handle)
  const initialDrawerHeight = typeof window !== "undefined"
    ? window.innerHeight * 0.3
    : 300;
  
  // Initialize drawer height
  useEffect(() => {
    if (drawerHeight === 0) {
      setDrawerHeight(initialDrawerHeight);
    }
  }, []);

  // Reset drawer height when switching between solo and team tabs
  useEffect(() => {
    setDrawerHeight(initialDrawerHeight);
  }, [mode, initialDrawerHeight]);

  // Adventure level configuration
  const adventureLevels = {
    regular: { locations: 2, points: 3, duration: 3 },
    medium: { locations: 4, points: 7, duration: 5 },
    adventurous: { locations: 6, points: 12, duration: 7 },
  };

  const currentLevel =
    adventureLevels[selectedLevel] || adventureLevels.regular;

  // Get user location
  useEffect(() => {
    if (profile?.current_latitude && profile?.current_longitude) {
      setUserLocation({
        lat: parseFloat(profile.current_latitude),
        lng: parseFloat(profile.current_longitude),
      });
      setIsLocationReady(true);
    }
  }, [profile]);

  // Geocode search query if provided
  useEffect(() => {
    const geocodeLocation = async () => {
      if (formData?.searchQuery && !formData?.selectedLocation) {
        try {
          const coords = await geocodeAddressWithCache(formData.searchQuery);
          if (coords) {
            setUserLocation({ lat: coords.lat, lng: coords.lng });
            setIsLocationReady(true);
          }
        } catch (error) {
          console.error("Error geocoding location:", error);
        }
      }
    };
    geocodeLocation();
  }, [formData?.searchQuery, formData?.selectedLocation]);

  // Calculate average price for a restaurant
  const calculateAveragePrice = (restaurant) => {
    if (!restaurant.menu_items || restaurant.menu_items.length === 0) {
      return null;
    }
    const prices = restaurant.menu_items
      .map((item) => parseFloat(item.price))
      .filter((price) => !isNaN(price));
    if (prices.length === 0) return null;
    const sum = prices.reduce((acc, price) => acc + price, 0);
    return Math.round(sum / prices.length);
  };

  // Filter restaurants based on user selections
  const filteredRestaurants = useMemo(() => {
    if (!restaurants || restaurants.length === 0) {
      console.log("No restaurants available");
      return [];
    }

    console.log("Filtering restaurants:", {
      totalRestaurants: restaurants.length,
      formData: formData,
    });

    const filtered = restaurants.filter((restaurant) => {
      // Filter by location (only if search query is provided)
      if (formData?.searchQuery && formData.searchQuery.trim() !== "") {
        const normalizedQuery = formData.searchQuery.toLowerCase();
        const matchesLocation =
          (restaurant.location &&
            restaurant.location.toLowerCase().includes(normalizedQuery)) ||
          (restaurant.vendor?.state &&
            restaurant.vendor.state.toLowerCase().includes(normalizedQuery)) ||
          (restaurant.vendor?.city &&
            restaurant.vendor.city.toLowerCase().includes(normalizedQuery)) ||
          (restaurant.name &&
            restaurant.name.toLowerCase().includes(normalizedQuery));
        if (!matchesLocation) return false;
      }

      // Filter by price range (only if both min and max are provided and valid)
      if (formData?.minPrice && formData?.maxPrice) {
        const min = parseFloat(formData.minPrice);
        const max = parseFloat(formData.maxPrice);
        if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
          const avgPrice = calculateAveragePrice(restaurant);
          if (avgPrice && (avgPrice < min || avgPrice > max)) {
            return false;
          }
        }
      }

      // Filter by food types (cuisine_type) - only if food types are selected
      if (
        formData?.selectedFoodTypes &&
        formData.selectedFoodTypes.length > 0
      ) {
        const matchesCuisine = formData.selectedFoodTypes.some(
          (type) => restaurant.cuisine_type === type
        );
        if (!matchesCuisine) return false;
      }

      // Filter by desserts/cafes if explicitly set to true
      if (formData?.includeDesserts === true) {
        const isDessertOrCafe =
          restaurant.food_category === "Dessert" ||
          restaurant.food_category === "Cafe";
        if (!isDessertOrCafe) return false;
      }

      return true;
    });

    console.log("Filtered restaurants count:", filtered.length);

    // If filtering removed all restaurants, return all restaurants (fallback)
    if (filtered.length === 0 && restaurants.length > 0) {
      console.log(
        "No restaurants matched filters, using all restaurants as fallback"
      );
      return restaurants;
    }

    return filtered;
  }, [restaurants, formData]);

  // Get nearby restaurants with distances
  const nearbyRestaurants = useMemo(() => {
    console.log("nearbyRestaurants calculation:", {
      restaurantsLoading,
      isLocationReady,
      userLocation,
      filteredRestaurantsCount: filteredRestaurants?.length || 0,
      currentLevelLocations: currentLevel.locations,
    });

    // If still loading, return empty
    if (restaurantsLoading) {
      return [];
    }

    // If no filtered restaurants, return empty
    if (!filteredRestaurants || filteredRestaurants.length === 0) {
      console.log("No filtered restaurants available");
      return [];
    }

    // Process restaurants - include those with or without coordinates
    let restaurantsWithDistance = filteredRestaurants
      .map((restaurant) => {
        const avgPrice = calculateAveragePrice(restaurant);
        const restaurantLat = restaurant?.latitude;
        const restaurantLng = restaurant?.longitude;

        let distance = 999; // Default distance if no coordinates
        if (
          restaurantLat &&
          restaurantLng &&
          userLocation.lat &&
          userLocation.lng
        ) {
          const calculatedDistance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            restaurantLat,
            restaurantLng
          );
          if (calculatedDistance !== null && !isNaN(calculatedDistance)) {
            distance = calculatedDistance;
          }
        }

        return {
          ...restaurant,
          coordinates: {
            lat: restaurantLat || userLocation.lat,
            lng: restaurantLng || userLocation.lng,
          },
          averagePrice: avgPrice,
          distance: distance,
        };
      })
      .sort((a, b) => a.distance - b.distance);

    // Select the required number of restaurants
    const selectedRestaurants = restaurantsWithDistance.slice(
      0,
      currentLevel.locations
    );

    console.log(
      "TreasureHuntActive - nearbyRestaurants:",
      selectedRestaurants.length,
      selectedRestaurants
    );
    return selectedRestaurants;
  }, [
    filteredRestaurants,
    userLocation,
    restaurantsLoading,
    currentLevel.locations,
  ]);

  // Debug logging
  useEffect(() => {
    console.log(
      "TreasureHuntActive - nearbyRestaurants count:",
      nearbyRestaurants.length
    );
    console.log("TreasureHuntActive - selectedLevel:", selectedLevel);
    console.log(
      "TreasureHuntActive - currentLevel.locations:",
      currentLevel.locations
    );
    console.log("TreasureHuntActive - isLocationReady:", isLocationReady);
    console.log("TreasureHuntActive - userLocation:", userLocation);
  }, [
    nearbyRestaurants,
    selectedLevel,
    currentLevel.locations,
    isLocationReady,
    userLocation,
  ]);

  // Drawer drag handlers
  const handleStart = useCallback(
    (clientY) => {
      setIsDragging(true);
      startYRef.current = clientY;
      startHeightRef.current = drawerHeight;
      hasMovedRef.current = false;
    },
    [drawerHeight]
  );

  const handleMove = useCallback(
    (clientY) => {
      if (!isDragging) return;
      const deltaY = Math.abs(startYRef.current - clientY);
      // Mark as moved if movement is more than 5px
      if (deltaY > 5) {
        hasMovedRef.current = true;
      }
      const newDeltaY = startYRef.current - clientY; // Positive when dragging up
      const newHeight = Math.max(
        minDrawerHeight,
        Math.min(maxDrawerHeight, startHeightRef.current + newDeltaY)
      );
      setDrawerHeight(newHeight);
    },
    [isDragging, maxDrawerHeight, minDrawerHeight]
  );

  const handleEnd = useCallback(() => {
    // If it was a tap (no significant movement), toggle drawer state
    if (!hasMovedRef.current) {
      if (drawerHeight <= minDrawerHeight) {
        // Expand drawer to initial height
        setDrawerHeight(initialDrawerHeight);
      } else {
        // Collapse drawer to minimum height
        setDrawerHeight(minDrawerHeight);
      }
    }
    setIsDragging(false);
  }, [drawerHeight, minDrawerHeight, initialDrawerHeight]);

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

  // Add event listeners for dragging
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
    return <LoadingComponent type="screen" text="Loading..." />;
  }

  if (error) {
    return <ErrorComponent message={error.message} />;
  }

  if (!selectedLevel || !formData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No adventure selected</p>
          <button
            onClick={() => navigate("/home?tab=treasure")}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go to Treasure Hunt
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {/* 3D Low Poly Scene */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <LowPolyScene
          restaurants={nearbyRestaurants}
          userLocation={userLocation}
        />
      </div>

      {/* Header with Tabs - Below Layout Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 pointer-events-auto">
        <div className="px-4 py-3">
          {/* Solo/Team Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("solo")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "solo"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Solo
            </button>
            <button
              onClick={() => setMode("team")}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "team"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Team
            </button>
          </div>
        </div>
      </div>

      {/* Draggable Bottom Card */}
      <div
        ref={drawerRef}
        className={`absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl pointer-events-auto flex flex-col ${
          isDragging ? "transition-none" : "transition-all duration-300"
        }`}
        style={{
          height: `${drawerHeight}px`,
          minHeight: `${minDrawerHeight}px`,
          maxHeight: `${maxDrawerHeight}px`,
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-5 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header Content */}
        <div 
          className={`px-4 pb-4 flex-1 flex flex-col ${
            drawerHeight > initialDrawerHeight 
              ? "overflow-y-auto" 
              : "overflow-hidden"
          }`}
        >
          {/* Collapsible Details Card */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl overflow-hidden">
            {/* Clickable Header */}
            <button
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
              className="w-full px-4 py-1 flex items-center justify-between hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center mr-2">
                  <img
                    src={chestImage}
                    alt="Treasure chest"
                    className="w-14 h-14 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Earn {currentLevel.points} PTS
                  </p>
                  <p className="text-xs font-light text-gray-500">
                    0/{currentLevel.locations} locations
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-primary rounded-full">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-xs font-medium text-white">
                      {currentLevel.duration} days
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                    !isDetailsCollapsed ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Collapsible Content - Restaurant List */}
            {!isDetailsCollapsed && (
              <div className="border-t border-primary/20 bg-white">
                {/* Restaurant List */}
                <div className="px-2 pb-2 pt-4 space-y-3">
                  {nearbyRestaurants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No restaurants found matching your criteria</p>
                    </div>
                  ) : (
                    nearbyRestaurants.map((restaurant, index) => {
                      const isCompleted = false; // TODO: Check if restaurant is completed
                      const spotLetter = String.fromCharCode(65 + index); // A, B, C, D...

                      return (
                        <div
                          key={restaurant.id}
                          onClick={() => {
                            navigate("/restaurant-detail", {
                              state: {
                                restaurant,
                                restaurantId: restaurant.id,
                                returnPath: "/treasure-hunt-active",
                              },
                            });
                          }}
                          className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        >
                          {/* Restaurant Image */}
                          <div className="relative w-20 h-20 rounded-tl-lg rounded-bl-lg overflow-hidden flex-shrink-0">
                            {restaurant.image_url ? (
                              <img
                                src={restaurant.image_url}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {isCompleted && (
                              <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-white" />
                              </div>
                            )}
                            {!isCompleted && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  ?
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Restaurant Info */}
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {restaurant.name}
                            </p>
                            <p className="text-xs font-light text-gray-500 truncate">
                              {restaurant.location ||
                                restaurant.vendor?.city ||
                                "Location"}
                            </p>
                          </div>

                          {/* Scan Button */}
                          {!isCompleted && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click from firing
                                navigate("/scan", {
                                  state: {
                                    restaurant,
                                    restaurantId: restaurant.id,
                                  },
                                });
                              }}
                              className="w-14 flex flex-col items-center gap-1 px-3 py-1.5 bg-primary/10 rounded-lg mr-2 text-primary border border-primary"
                            >
                              <QrCode className="w-6 h-6" />
                              <span className="text-[10px] font-medium">
                                Scan
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invite Friend Button - Always at bottom */}
        {mode === "team" && (
          <div className="px-4 pb-4 mt-auto">
            <button
              onClick={() => navigate("/invite-friends", {
                state: {
                  returnPath: "/treasure-hunt-active",
                  returnState: {
                    selectedLevel: location.state?.selectedLevel,
                    formData: location.state?.formData,
                    mode: location.state?.mode || "team",
                    returnMode: location.state?.returnMode || "team",
                  },
                },
              })}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium text-sm"
            >
              Invite Friend
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
