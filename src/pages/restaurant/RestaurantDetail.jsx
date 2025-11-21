import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Sparkles,
  X,
  Clock,
  Phone,
  Shield,
  UtensilsCrossed,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRestaurantReviews } from "@/hooks/useRestaurantReviews";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { addCacheBuster } from "@/utils/addCacheBuster";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import ImageWithFallback from "@/components/ImageWithFallback";
import { calculateDistance, formatDistance } from "@/lib/calculateDistance";
import { geocodeAddressWithCache } from "@/lib/geocodeAddress";
import ReviewsDrawer from "./components/ReviewsDrawer";
import VendorProfileDrawer from "./components/VendorProfileDrawer";
import VouchersSection from "./components/VouchersSection";
import SlideDrawer from "@/components/SlideDrawer";
import { checkAndCleanupStorage } from "@/utils/storageCleanup";
import { toast } from "sonner";

export default function RestaurantDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [dragStart, setDragStart] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [isReviewsDrawerOpen, setIsReviewsDrawerOpen] = useState(false);
  const [isVendorProfileDrawerOpen, setIsVendorProfileDrawerOpen] =
    useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu"); // "menu" or "photos"
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);

  // Get restaurant data from navigation state
  const restaurant = location.state?.restaurant;
  const imageTransition = location.state?.imageTransition;
  const returnPath = location.state?.returnPath; // Store where user came from

  // Fetch reviews after restaurant is defined
  const { data: reviewsData } = useRestaurantReviews(restaurant?.id);

  // Fetch vouchers for this restaurant
  const { data: vouchers = [] } = useQuery({
    queryKey: ["restaurantVouchers", restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vouchers:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!restaurant?.id,
  });

  // Sync modal image index when opening
  useEffect(() => {
    if (isImageModalOpen) {
      setModalImageIndex(currentImageIndex);
    }
  }, [isImageModalOpen, currentImageIndex]);

  // Debug: Log transition data
  useEffect(() => {
    if (imageTransition) {
      console.log("Image transition data:", imageTransition);
    }
  }, [imageTransition]);

  // Get all menu images for the gallery
  const allImages =
    restaurant?.menu_items
      ?.filter((item) => item.image_url)
      ?.map((item) => item.image_url) || [];

  // Add restaurant image if available
  if (restaurant?.image_url && !allImages.includes(restaurant.image_url)) {
    allImages.unshift(restaurant.image_url);
  }

  const totalImages = allImages.length || 1;
  const currentImage = allImages[currentImageIndex] || restaurant?.image_url;

  // Calculate available menu items count
  const availableMenuItems =
    restaurant?.menu_items?.filter((item) => item.is_available !== false) || [];
  const availableMenuItemsCount = availableMenuItems.length;

  // State for distance
  const [formattedDistance, setFormattedDistance] = useState(null);

  // Cleanup storage on page load
  useEffect(() => {
    checkAndCleanupStorage();
  }, []);

  // Geocode restaurant address and calculate distance
  useEffect(() => {
    const calculateRestaurantDistance = async () => {
      const userLat = profile?.current_latitude;
      const userLng = profile?.current_longitude;

      // Need user location to calculate distance
      if (!userLat || !userLng) {
        setFormattedDistance(null);
        return;
      }

      // Try to get coordinates from restaurant data first (if lat/lng fields exist)
      let restaurantLat = restaurant?.latitude;
      let restaurantLng = restaurant?.longitude;

      // If no coordinates, geocode the address
      if (!restaurantLat || !restaurantLng) {
        const address = restaurant?.address || restaurant?.location;
        if (address) {
          try {
            const coords = await geocodeAddressWithCache(address);
            if (coords) {
              restaurantLat = coords.lat;
              restaurantLng = coords.lng;
            }
          } catch (error) {
            // If quota error, cleanup and continue without caching
            if (
              error.message?.includes("quota") ||
              error.name === "QuotaExceededError"
            ) {
              console.warn(
                "Storage quota error during geocoding, continuing without cache..."
              );
              checkAndCleanupStorage();
            }
            // Continue without coordinates if geocoding fails
          }
        }
      }

      // Calculate distance if we have both coordinates
      if (restaurantLat && restaurantLng) {
        const distance = calculateDistance(
          Number(userLat),
          Number(userLng),
          Number(restaurantLat),
          Number(restaurantLng)
        );
        setFormattedDistance(formatDistance(distance));
      } else {
        setFormattedDistance(null);
      }
    };

    if (restaurant && profile) {
      calculateRestaurantDistance();
    }
  }, [restaurant, profile]);

  // Handle share functionality
  const handleShare = async () => {
    if (!restaurant) return;

    const shareUrl = window.location.href;
    const shareText = `Check out ${restaurant.name}${
      restaurant.location ? ` in ${restaurant.location}` : ""
    } on Food Hunter!`;

    // Use Web Share API if available (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurant.name || "Restaurant",
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to share");
      }
    }
  };

  // Reusable bottom content section component
  const renderBottomContent = (onRatingsClick) => (
    <div
      className="relative bg-white rounded-t-3xl pt-6 pb-24 z-30"
      style={{
        marginTop: "-5rem",
      }}
    >
      <div className="px-6 space-y-6">
        {/* Title and Location */}
        <div>
          <h1 className="text-2xl font-bold text-black mb-2 text-center">
            {restaurant.name || "Restaurant"}
          </h1>
          <div className="space-y-2">
            <p className="text-sm font-light text-gray-500 text-center">
              {restaurant.location || restaurant.address || "Restaurant"}
              {restaurant.cuisine_type && ` · ${restaurant.cuisine_type}`}
              {restaurant.food_category && ` · ${restaurant.food_category}`}
              {formattedDistance && ` · ${formattedDistance} away`}
            </p>
            {availableMenuItemsCount > 0 && (
              <p className="text-sm text-gray-600 text-center">
                {availableMenuItemsCount} menu item
                {availableMenuItemsCount !== 1 ? "s" : ""} available
              </p>
            )}
          </div>
        </div>

        {/* Ratings and Reviews */}
        <button
          onClick={onRatingsClick}
          className="w-full flex items-center gap-4 pb-4 border-b border-gray-200 justify-center hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-black text-black" />
            <span className="text-base font-semibold text-black">{rating}</span>
          </div>
          <div className="text-gray-400 font-extralight">|</div>
          <span className="text-sm text-gray-600">{reviewCount} Reviews</span>
        </button>

        {/* Vendor Information */}
        {restaurant.vendor && (
          <button
            onClick={() => setIsVendorProfileDrawerOpen(true)}
            className="w-full flex items-start gap-3 pb-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="relative flex-shrink-0">
              {restaurant.vendor.business_logo_url ? (
                <img
                  src={restaurant.vendor.business_logo_url}
                  alt={
                    restaurant.vendor.business_name || restaurant.vendor.name
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-600">
                    {(
                      restaurant.vendor.name || restaurant.vendor.business_name
                    )?.charAt(0) || "V"}
                  </span>
                </div>
              )}
              {restaurant.vendor.verified_status === "verified" && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-left my-auto">
              <p className="text-sm font-semibold text-black">
                {restaurant.vendor.name ||
                  restaurant.vendor.business_name ||
                  "Vendor"}
              </p>
              <p className="text-xs text-gray-500">
                {restaurant.vendor.verified_status === "verified"
                  ? "Verified vendor"
                  : "Vendor"}
              </p>
            </div>
          </button>
        )}

        {/* Highlights */}
        <div className="space-y-3 pb-6 border-b border-gray-200">
          {restaurant.description && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {restaurant.description}
              </p>
            </div>
          )}

          {restaurant.hours && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm text-gray-600">{restaurant.hours}</p>
            </div>
          )}

          {restaurant.phone_number && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm text-gray-600">{restaurant.phone_number}</p>
            </div>
          )}

          {restaurant.address && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-black" />
              </div>
              <p className="text-sm text-gray-600">{restaurant.address}</p>
            </div>
          )}

          {(restaurant.food_category || restaurant.cuisine_type) && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine_type && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                    {restaurant.cuisine_type}
                  </span>
                )}
                {restaurant.food_category &&
                  restaurant.food_category !== "All" && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                      {restaurant.food_category}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Vouchers Section */}
        <VouchersSection
          vouchers={vouchers}
          onVoucherClick={(voucher) => {
            setSelectedVoucher(voucher);
            setIsVoucherDrawerOpen(true);
          }}
        />

        {/* Menu/Photos Tabs */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("menu")}
              className={`w-full flex justify-center items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === "menu"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              <UtensilsCrossed
                className={`w-5 h-5 ${
                  activeTab === "menu" ? "text-purple-600" : "text-gray-500"
                }`}
              />
              <span className="font-medium">Menu</span>
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`w-full flex justify-center items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
                activeTab === "photos"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              <ImageIcon
                className={`w-5 h-5 ${
                  activeTab === "photos" ? "text-purple-600" : "text-gray-500"
                }`}
              />
              <span className="font-medium">Photos</span>
            </button>
          </div>

          {/* Menu Tab Content */}
          {activeTab === "menu" && availableMenuItemsCount > 0 && (
            <div className="space-y-6">
              {availableMenuItems.map((menuItem) => {
                const menuImage = menuItem.image_url;
                return (
                  <button
                    key={menuItem.id}
                    onClick={() => {
                      setSelectedMenuItem(menuItem);
                      setIsMenuItemModalOpen(true);
                    }}
                    className="w-full flex gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    {menuImage && (
                      <img
                        src={menuImage}
                        alt={menuItem.name}
                        className="w-22 h-22 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-black truncate">
                        {menuItem.name}
                      </h3>
                      {menuItem.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {menuItem.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-semibold text-black">
                          RM{menuItem.price?.toFixed(0) || 0}
                        </p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-gray-400 text-gray-400" />
                          <span className="text-xs font-light text-gray-400">
                            {menuItem.average_rating
                              ? menuItem.average_rating.toFixed(1)
                              : "0.0"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Photos Tab Content */}
          {activeTab === "photos" && (
            <div className="grid grid-cols-3 gap-2">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setIsImageModalOpen(true);
                  }}
                  className="aspect-square rounded-lg overflow-hidden"
                >
                  <ImageWithFallback
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {allImages.length === 0 && (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  <p className="text-sm">No photos available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Mark animation as complete after transition
    if (imageTransition) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [restaurant, imageTransition]);

  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // If no restaurant data, redirect back
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Restaurant not found</p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get rating and review count from database
  const rating = reviewsData?.averageRating || 0;
  const reviewCount = reviewsData?.totalReviews || 0;

  // Calculate initial and final positions for animation
  const getContainerAnimationProps = () => {
    if (imageTransition && isAnimating) {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Use the card's position and dimensions as initial values
      const initialX = imageTransition.x;
      const initialY = imageTransition.y;
      const initialWidth = imageTransition.width;
      const initialHeight = imageTransition.height;

      return {
        initial: {
          x: initialX,
          y: initialY,
          width: initialWidth,
          height: initialHeight,
          borderRadius: 24,
        },
        animate: {
          x: 0,
          y: 0,
          width: viewportWidth,
          height: viewportHeight,
          borderRadius: 0,
        },
        transition: {
          duration: 0.6,
          ease: [0.43, 0.13, 0.23, 0.96], // Custom easing for smooth zoom
        },
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 50,
          overflow: "hidden",
        },
      };
    }
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 },
    };
  };

  return (
    <>
      {/* Background overlay during animation */}
      {imageTransition && isAnimating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black z-40"
        />
      )}

      {/* Animated Container - wraps both image and content */}
      {imageTransition && isAnimating ? (
        <motion.div
          {...getContainerAnimationProps()}
          onAnimationComplete={() => {
            setIsAnimating(false);
          }}
          className="bg-white"
        >
          <div className="w-full h-full flex flex-col overflow-y-auto">
            {/* Full-Screen Image Section */}
            <motion.div
              className="relative w-full h-[40vh] bg-gray-200 flex-shrink-0 overflow-hidden"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={(event, info) => setDragStart(info.point.x)}
              onDragEnd={(event, info) => {
                const dragDistance = info.point.x - dragStart;
                const threshold = 50; // minimum distance to trigger swipe

                if (dragDistance > threshold && currentImageIndex > 0) {
                  setCurrentImageIndex((prev) => prev - 1);
                } else if (
                  dragDistance < -threshold &&
                  currentImageIndex < totalImages - 1
                ) {
                  setCurrentImageIndex((prev) => prev + 1);
                }
              }}
              style={{ touchAction: "pan-y" }}
            >
              {currentImage ? (
                <div
                  onClick={() => {
                    setModalImageIndex(currentImageIndex);
                    setIsImageModalOpen(true);
                  }}
                  className="w-full h-full cursor-pointer"
                >
                  <ImageWithFallback
                    src={currentImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {/* Top Navigation Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  imageTransition
                    ? { delay: 0.5, duration: 0.3 }
                    : { delay: 0.4, duration: 0.3 }
                }
                className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10"
              >
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (returnPath) {
                      navigate(returnPath);
                    } else {
                      // Default to restaurants view
                      navigate("/home?tab=restaurants");
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-black" />
                </button>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isFavorite ? "fill-red-500 text-red-500" : "text-black"
                      }`}
                    />
                  </button>
                </div>
              </motion.div>

              {/* Photo Counter */}
              {totalImages > 1 && (
                <div className="absolute bottom-24 right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium z-20">
                  {currentImageIndex + 1}/{totalImages}
                </div>
              )}
            </motion.div>

            {/* Bottom Content Section */}
            {renderBottomContent(() => setIsReviewsDrawerOpen(true))}
          </div>
        </motion.div>
      ) : null}

      {/* Static container for after animation */}
      {!isAnimating && (
        <div className="min-h-screen bg-white relative overflow-hidden">
          {/* Full-Screen Image Section */}
          <motion.div
            className="relative w-full h-[40vh] bg-gray-200 overflow-hidden"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={(event, info) => setDragStart(info.point.x)}
            onDragEnd={(event, info) => {
              const dragDistance = info.point.x - dragStart;
              const threshold = 50; // minimum distance to trigger swipe

              if (dragDistance > threshold && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
              } else if (
                dragDistance < -threshold &&
                currentImageIndex < totalImages - 1
              ) {
                setCurrentImageIndex((prev) => prev + 1);
              }
            }}
            style={{ touchAction: "pan-y" }}
          >
            {currentImage ? (
              <div
                onClick={() => {
                  setModalImageIndex(currentImageIndex);
                  setIsImageModalOpen(true);
                }}
                className="w-full h-full cursor-pointer"
              >
                <ImageWithFallback
                  src={currentImage}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="h-16 w-16 text-gray-400" />
              </div>
            )}

            {/* Top Navigation Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10"
            >
              {/* Back Button */}
              <button
                onClick={() => {
                  if (returnPath) {
                    navigate(returnPath);
                  } else {
                    // Default to restaurants view
                    navigate("/home?tab=restaurants");
                  }
                }}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-black" />
              </button>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-black" />
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-black"
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Photo Counter */}
            {totalImages > 1 && (
              <div className="absolute bottom-24 right-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium z-20">
                {currentImageIndex + 1}/{totalImages}
              </div>
            )}
          </motion.div>

          {/* Bottom Content Section */}
          {renderBottomContent(() => setIsReviewsDrawerOpen(true))}
        </div>
      )}

      {/* Reviews Drawer */}
      <ReviewsDrawer
        open={isReviewsDrawerOpen}
        onClose={() => setIsReviewsDrawerOpen(false)}
        restaurant={restaurant}
        rating={rating}
        reviewCount={reviewCount}
      />

      {/* Vendor Profile Drawer */}
      <VendorProfileDrawer
        open={isVendorProfileDrawerOpen}
        onClose={() => setIsVendorProfileDrawerOpen(false)}
        vendor={restaurant?.vendor}
        restaurant={restaurant}
      />

      {/* Voucher Detail Drawer */}
      <SlideDrawer
        open={isVoucherDrawerOpen}
        onClose={() => {
          setIsVoucherDrawerOpen(false);
          setSelectedVoucher(null);
        }}
        title="Voucher Rewards"
        direction="bottom"
        zIndex={{ overlay: 59, drawer: 60 }}
        showBackButton={true}
        bottomSection={
          selectedVoucher && (
            <div className="p-4 bg-white border-t border-gray-200">
              <Button
                onClick={() => {
                  // Handle redeem logic here
                  toast.success("Voucher redeemed!");
                  setIsVoucherDrawerOpen(false);
                }}
                className="w-full h-12 bg-primary text-white hover:bg-primary-hover/90 rounded-xl font-medium"
              >
                Redeem Now
              </Button>
            </div>
          )
        }
      >
        {selectedVoucher && (
          <div className="flex flex-col h-full">
            {/* Image Section */}
            {(() => {
              const getVoucherImageUrl = (imageUrl) => {
                if (!imageUrl) return null;
                if (
                  imageUrl.startsWith("http://") ||
                  imageUrl.startsWith("https://")
                ) {
                  return addCacheBuster(imageUrl);
                }
                const {
                  data: { publicUrl },
                } = supabase.storage
                  .from("voucher-images")
                  .getPublicUrl(imageUrl);
                return addCacheBuster(publicUrl);
              };
              const voucherImageUrl = getVoucherImageUrl(
                selectedVoucher.image_url
              );

              return (
                <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                  {voucherImageUrl ? (
                    <img
                      src={voucherImageUrl}
                      alt={selectedVoucher.title || "Voucher"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Clock className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Voucher Details Section */}
            <div className="flex-1 bg-white px-6 py-6 space-y-4 overflow-y-auto">
              {/* Points */}
              <div>
                <p className="text-sm font-bold text-black mb-1">Points</p>
                <p className="text-sm text-gray-500">
                  {selectedVoucher.required_redemption_points || 0} points
                </p>
              </div>

              {/* Validity - Calculate days from created_at (or use a default) */}
              <div>
                <p className="text-sm font-bold text-black mb-1">Validity</p>
                <p className="text-sm text-gray-500">
                  {(() => {
                    // Since there's no valid_until in schema, show a placeholder or calculate from created_at
                    // You can update this logic based on your business rules
                    const createdDate = new Date(selectedVoucher.created_at);
                    const daysSinceCreation = Math.floor(
                      (new Date() - createdDate) / (1000 * 60 * 60 * 24)
                    );
                    // Assuming 30 days validity from creation
                    const validityDays = 30 - daysSinceCreation;
                    return validityDays > 0
                      ? `${validityDays} days`
                      : "Expired";
                  })()}
                </p>
              </div>

              {/* Min. Spend */}
              <div>
                <p className="text-sm font-bold text-black mb-1">Min. Spend</p>
                <p className="text-sm text-gray-500">
                  RM{selectedVoucher.min_spend?.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Terms and Conditions */}
              {selectedVoucher.terms_and_conditions && (
                <div>
                  <p className="text-sm font-bold text-black mb-2">
                    Terms and Conditions
                  </p>
                  <div className="text-sm text-gray-500 whitespace-pre-line">
                    {selectedVoucher.terms_and_conditions}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Menu Item Detail Modal */}
      <Dialog open={isMenuItemModalOpen} onOpenChange={setIsMenuItemModalOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-h-[90vh] overflow-y-auto p-0 bg-white border-none rounded-3xl">
          {selectedMenuItem && (
            <div className="flex flex-col">
              {/* Image */}
              {selectedMenuItem.image_url && (
                <div className="w-full h-64 sm:h-80 overflow-hidden">
                  <img
                    src={selectedMenuItem.image_url}
                    alt={selectedMenuItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-md font-bold text-black mb-2">
                      {selectedMenuItem.name}
                    </h2>
                    {selectedMenuItem.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {selectedMenuItem.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating and Price */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    {selectedMenuItem.average_rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-gray-400 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {selectedMenuItem.average_rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-bold text-black">
                    RM{selectedMenuItem.price?.toFixed(2) || "0.00"}
                  </p>
                </div>

                {/* Category */}
                {selectedMenuItem.category && (
                  <div className="pt-2">
                    <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {selectedMenuItem.category.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-full w-full h-full max-h-full p-0 bg-black border-0 rounded-none">
          <DialogTitle className="sr-only">
            {restaurant.name} - Image Gallery
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and navigate through restaurant images
          </DialogDescription>

          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-50">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? "fill-red-500 text-red-500" : "text-white"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
              {allImages[modalImageIndex] ? (
                <motion.div
                  key={modalImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={(event, info) => setDragStart(info.point.x)}
                  onDragEnd={(event, info) => {
                    const dragDistance = info.point.x - dragStart;
                    const threshold = 50;

                    if (dragDistance > threshold && modalImageIndex > 0) {
                      setModalImageIndex((prev) => prev - 1);
                    } else if (
                      dragDistance < -threshold &&
                      modalImageIndex < totalImages - 1
                    ) {
                      setModalImageIndex((prev) => prev + 1);
                    }
                  }}
                  style={{ touchAction: "pan-y" }}
                >
                  <ImageWithFallback
                    src={allImages[modalImageIndex]}
                    alt={`${restaurant.name} - Image ${modalImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  {modalImageIndex > 0 && (
                    <button
                      onClick={() => setModalImageIndex((prev) => prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                  )}
                  {modalImageIndex < totalImages - 1 && (
                    <button
                      onClick={() => setModalImageIndex((prev) => prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors z-10"
                    >
                      <ChevronLeft className="w-5 h-5 text-white rotate-180" />
                    </button>
                  )}
                </>
              )}

              {/* Image Counter */}
              {totalImages > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
                  {modalImageIndex + 1} of {totalImages}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {totalImages > 1 && (
              <div className="bg-black/50 backdrop-blur-sm border-t border-white/10 p-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar justify-center">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === modalImageIndex
                          ? "border-white"
                          : "border-white/30 opacity-50"
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
