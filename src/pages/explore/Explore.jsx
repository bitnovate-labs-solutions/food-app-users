import { useState } from "react";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { useFoodCategoryEnum } from "@/hooks/useEnumValues";
import { usePromoVouchers } from "@/hooks/usePromoVouchers";

// COMPONENTS
import ExploreCard from "./components/ExploreCard";
import CategoryCard from "@/pages/explore/components/CategoryCard";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import EmptyState from "@/components/common/EmptyState";
import VoucherCarousel from "./components/VoucherCarousel";

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  // DATA HOOKS ---------------------------------------------------------------
  const {
    data: restaurants,
    isLoading: isLoadingRestaurants,
    error: errorRestaurants,
  } = useRestaurantsBO();
  const {
    data: foodCategories,
    isLoading: isLoadingFoodCategories,
    error: errorFoodCategories,
  } = useFoodCategoryEnum();
  const {
    data: voucherUpdates,
    isLoading: isLoadingPromoVouchers,
    error: errorPromoVouchers,
  } = usePromoVouchers();

  // Create "restaurant-menu package" pairs
  const restaurantPackages = restaurants?.flatMap((restaurant) => {
    if (!restaurant.menu_packages) return [];

    return restaurant.menu_packages?.map((menuPackage) => ({
      ...restaurant,
      menu_packages: [menuPackage],
    }));
  });

  // Filter restaurant packages based on active category
  const filteredRestaurantPackages = restaurantPackages?.filter((item) => {
    if (activeCategory === "All") return true;
    return item.food_category === activeCategory;
  });

  // LOADING AND ERROR HANDLING ---------------------------------------------------------------
  if (isLoadingRestaurants || isLoadingFoodCategories || isLoadingPromoVouchers)
    return <LoadingComponent type="screen" text="Loading..." />;
  if (errorRestaurants)
    return <ErrorComponent message={errorRestaurants.message} />;
  if (errorFoodCategories)
    return <ErrorComponent message={errorFoodCategories.message} />;
  if (errorPromoVouchers)
    return <ErrorComponent message={errorPromoVouchers.message} />;

  return (
    <div className="container mx-auto px-4 pt-3 pb-20">
      <div className="mb-10">
        <h2 className="text-gray-900 font-semibold mb-2">Popular</h2>
        {/* VOUCHER CAROUSEL + PAGINATION DOTS ------------------------------------------ */}
        <VoucherCarousel voucherUpdates={voucherUpdates} />
      </div>

      {/* FOOD CATEGORY FILTERS ------------------------------------------ */}
      <div className="mb-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          <CategoryCard
            label="All"
            value="All"
            isActive={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
          />
          {foodCategories.map((category, index) => (
            <CategoryCard
              key={index}
              {...category}
              isActive={activeCategory === category.value}
              onClick={() => setActiveCategory(category.value)}
            />
          ))}
        </div>
      </div>

      {/* WHAT'S TRENDING SECTION ------------------------------------------ */}
      <div>
        <h2 className="font-semibold mb-2">What&apos;s Trending</h2>
        <div className="gap-2">
          {filteredRestaurantPackages?.length > 0 ? (
            filteredRestaurantPackages?.map((item) => (
              // EXPLORE CARD ------------------------------------------
              <ExploreCard
                key={`${item.id}-${item.menu_packages[0].id}`}
                item={item}
              />
            ))
          ) : (
            // EMPTY STATE ------------------------------------------
            <EmptyState
              icon="search"
              title={
                activeCategory === "All"
                  ? "No menu packages found"
                  : `No ${activeCategory} menu packages found`
              }
              description={
                activeCategory === "All"
                  ? "Try adjusting your filters or check back later for new menu packages."
                  : "Try adjusting your filters or check back later for new menu packages in this category."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
