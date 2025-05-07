import { useState, useRef, useEffect } from "react";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { useFoodCategoryEnum } from "@/hooks/useEnumValues";

// COMPONENTS
import ExploreCard from "./components/ExploreCard";
import VoucherCard from "./components/VoucherCard";
import CategoryCard from "@/pages/explore/components/CategoryCard";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { usePromoVouchers } from "@/hooks/usePromoVouchers";
import { Search } from "lucide-react";

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const slideRefs = useRef([]);

  // HOOKS ---------------------------------------------------------------
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

  // Create an array of restaurant-package pairs
  const restaurantPackages = restaurants
    ?.flatMap((restaurant) =>
      restaurant.menu_packages?.map((menuPackage) => ({
        ...restaurant,
        menu_packages: [menuPackage], // Replace with single package
      }))
    )
    .filter(Boolean); // Remove any undefined entries

  // Filter restaurant packages based on active category
  const filteredRestaurantPackages = restaurantPackages?.filter((item) => {
    if (activeCategory === "All") return true;
    return item.food_category === activeCategory;
  });

  // Set up Intersection Observer ---------------------------------------------------------------
  useEffect(() => {
    const options = {
      root: scrollRef.current,
      rootMargin: "0px",
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = slideRefs.current.indexOf(entry.target);
          if (index !== -1) {
            setCurrentSlide(index);
          }
        }
      });
    }, options);

    // Capture current refs value
    const currentSlideRefs = slideRefs.current;

    // Observe each slide
    currentSlideRefs.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => {
      // Use captured refs value in cleanup
      currentSlideRefs.forEach((slide) => {
        if (slide) observer.unobserve(slide);
      });
    };
  }, [voucherUpdates]);

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
        <div className="relative">
          {/* CAROUSEL */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth touch-pan-x"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {voucherUpdates.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => (slideRefs.current[index] = el)}
                className="flex-none w-full snap-center px-[1px]"
                style={{
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                }}
              >
                <VoucherCard item={item} />
              </div>
            ))}
          </div>

          {/* PAGINATION DOTS */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {voucherUpdates.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (scrollRef.current && slideRefs.current[index]) {
                    slideRefs.current[index].scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }
                }}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  currentSlide === index ? "bg-primary" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
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

      {/* WHAT'S TRENDING */}
      <div>
        <h2 className="font-semibold mb-2">What&apos;s Trending</h2>
        <div className="gap-2">
          {filteredRestaurantPackages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg text-center font-semibold text-gray-900 mb-2">
                {activeCategory === "All"
                  ? "No menu packages found"
                  : `No ${activeCategory} menu packages found`}
              </h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {activeCategory === "All"
                  ? "Try adjusting your filters or check back later for new menu packages."
                  : "Try adjusting your filters or check back later for new menu packages in this category."}
              </p>
            </div>
          ) : (
            filteredRestaurantPackages?.map((item) => (
              <ExploreCard
                key={`${item.id}-${item.menu_packages[0].id}`}
                item={item}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
