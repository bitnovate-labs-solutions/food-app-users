import { useState, useRef } from "react";
import { Heart } from "lucide-react";

export default function RestaurantCard({ restaurant, onClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const swipeStartX = useRef(0);
  const swipeStartY = useRef(0);

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

  const allImageData = [...restaurantImageData, ...menuItemsWithImages];
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

  const currentImageData = imageData[currentImageIndex];
  const currentMenuItem = currentImageData?.menuItem;

  const handleSwipeStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    swipeStartX.current = clientX;
    swipeStartY.current = clientY;
  };

  const handleSwipeMove = (e) => {
    if (!swipeStartX.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - swipeStartX.current;
    const deltaY = Math.abs(clientY - swipeStartY.current);

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  };

  const handleSwipeEnd = (e) => {
    if (!swipeStartX.current) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const deltaX = clientX - swipeStartX.current;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold && imageData.length > 1) {
      if (deltaX > 0 && currentImageIndex > 0) {
        // Swipe right - previous image
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (deltaX < 0 && currentImageIndex < imageData.length - 1) {
        // Swipe left - next image
        setCurrentImageIndex(currentImageIndex + 1);
      }
    }
    swipeStartX.current = 0;
    swipeStartY.current = 0;
  };

  // Format restaurant info (location, cuisine, category, distance)
  const formatRestaurantInfo = () => {
    const parts = [];

    // Location (city or state from vendor, or location field)
    const location =
      restaurant.vendor?.city ||
      restaurant.vendor?.state ||
      restaurant.location?.split(",")[0] ||
      restaurant.address?.split(",")[0];
    if (location) {
      parts.push(location.trim());
    }

    // Cuisine type
    if (restaurant.cuisine_type) {
      parts.push(restaurant.cuisine_type);
    }

    // Food category
    if (restaurant.food_category && restaurant.food_category !== "All") {
      parts.push(restaurant.food_category);
    }

    // Distance
    if (restaurant.formattedDistance) {
      parts.push(`${restaurant.formattedDistance} away`);
    }

    return parts.length > 0 ? parts.join(" · ") : "";
  };

  return (
    <div className="cursor-pointer" onClick={() => onClick(restaurant)}>
      <div className="relative">
        <div
          className="relative w-full h-34 rounded-3xl overflow-hidden"
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          onMouseDown={handleSwipeStart}
          onMouseMove={handleSwipeMove}
          onMouseUp={handleSwipeEnd}
          onMouseLeave={handleSwipeEnd}
        >
          <div className="relative w-full h-full">
            {imageData.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={
                      item.menuItem
                        ? item.menuItem.name
                        : `${restaurant.name} - Image ${index + 1}`
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">🍽️</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Menu Item Info Overlay */}
          {currentMenuItem && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-3xl">
              <div className="text-white">
                <h3 className="text-sm font-semibold mb-1 line-clamp-1">
                  {currentMenuItem.name}
                </h3>
                <div className="flex items-center justify-start">
                  <span className="text-sm font-semibold">
                    RM{parseFloat(currentMenuItem.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <button
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              // Handle favorite
            }}
          >
            <Heart className="w-3 h-3 text-black" />
          </button>
          {/* Dot Pagination */}
          {imageData.length > 1 && (
            <div
              className={`absolute left-1/2 transform -translate-x-1/2 flex gap-1.5 ${
                currentMenuItem ? "bottom-16" : "bottom-3"
              }`}
            >
              {imageData.map((_, index) => (
                <button
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-[12px] text-black font-medium mb-1 line-clamp-1">
            {restaurant.name || "Restaurant"}
          </p>
          <p className="text-[12px] text-gray-600 font-light line-clamp-1">
            {formatRestaurantInfo()}
          </p>
        </div>
      </div>
    </div>
  );
}
