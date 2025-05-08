import { useState } from "react";
import { useFilters } from "@/context/FilterContext";
import { useRestaurantsBO } from "@/hooks/useRestaurantsBO";

// COMPONENTS
import TreaterCard from "../components/TreaterCard";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";
import EmptyState from "@/components/common/EmptyState";

export default function Menu() {
  const [expandedId, setExpandedId] = useState(null);
  const { filters } = useFilters();

  const { data: restaurants, isLoading, error } = useRestaurantsBO();

  // LOADING AND ERROR HANDLERS ----------------------------------------------
  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // Filter the food items based on the current filters ----------------------------------------------
  const filteredItems = restaurants?.filter((item) => {
    // Filter out restaurants without menu packages
    if (!item.menu_packages || item.menu_packages.length === 0) {
      return false;
    }

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
      {sortedItems?.length > 0 ? (
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
      ) : (
        <EmptyState
          icon="search"
          title={
            filters.category
              ? `No ${filters.category} restaurants found`
              : "No restaurants found"
          }
          description={
            filters.category
              ? "Try adjusting your filters or check back later for new restaurants in this category."
              : "Try adjusting your filters or check back later for new restaurants."
          }
        />
      )}
    </div>
  );
}
