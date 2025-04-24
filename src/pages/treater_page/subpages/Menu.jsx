import { useState } from "react";
import { useFilters } from "@/context/FilterContext";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";

// COMPONENTS
import TreaterCard from "../components/TreaterCard";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { Search } from "lucide-react";

export default function Menu() {
  const [expandedId, setExpandedId] = useState(null);
  const { filters } = useFilters();

  const { data: restaurants, isLoading, error } = useRestaurantsBO();

  // LOADING AND ERROR HANDLERS
  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // FROM MOCK DATA
  // const { data: foodItems } = useQuery({
  //   queryKey: ["foodItems", "menu", filters],
  //   queryFn: mockApi.getMenuItems,
  // });

  // Filter the food items based on the current filters
  const filteredItems = restaurants?.filter((item) => {
    // Filter by cuisine type
    if (filters.cuisine && item.cuisine_type !== filters.cuisine) {
      return false;
    }

    // Filter by category
    if (filters.category && item.food_category !== filters.category) {
      return false;
    }

    return true;
  });

  // Sort the filtered items based on the sort filter
  const sortedItems = filteredItems?.sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "trending":
        return b.likes - a.likes;
      case "rating_high":
        return b.rating - a.rating;
      case "rating_low":
        return a.rating - b.rating;
      case "price_high":
        return b.price - a.price;
      case "price_low":
        return a.price - b.price;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-3 pb-22">
      {sortedItems?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filters.category
              ? `No ${filters.category} restaurants found`
              : "No restaurants found"}
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {filters.category
              ? "Try adjusting your filters or check back later for new restaurants in this category."
              : "Try adjusting your filters or check back later for new restaurants."}
          </p>
        </div>
      ) : (
        sortedItems?.map((item) => (
          <TreaterCard
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
          />
        ))
      )}
    </div>
  );
}
