import { useState, useRef, useEffect } from "react";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";
import { voucherUpdates } from "@/data/mock_data";
import { useFoodCategoryEnum } from "@/hooks/useEnumValues";

// COMPONENTS
import ExploreCard from "./components/ExploreCard";
import VoucherCard from "./components/VoucherCard";
import CategoryCard from "@/pages/explore_page/components/CategoryCard";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

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
  if (isLoadingRestaurants || isLoadingFoodCategories)
    return <LoadingComponent type="screen" text="Loading..." />;

  if (errorRestaurants)
    return <ErrorComponent message={errorRestaurants.message} />;
  if (errorFoodCategories)
    return <ErrorComponent message={errorFoodCategories.message} />;

  return (
    <div className="container mx-auto px-4 pt-5 pb-20">
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
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
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
        <h2 className="font-semibold mb-4">What&apos;s Trending</h2>
        <div className="gap-2">
          {restaurants.map((item) => (
            <ExploreCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
