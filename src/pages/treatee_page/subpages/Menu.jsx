// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/lib/supabase";
// import { mockApi } from "@/data/mock_data";
import TreateeCard from "../components/TreateeCard";

// COMPONENTS
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useFilters } from "@/context/FilterContext";
import { usePurchasedItems } from "@/hooks/usePurchases";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

export default function Menu() {
  const { filters } = useFilters();

  const { data: purchaseItems, isLoading, error } = usePurchasedItems();

  // console.log(purchaseItems);

  // LOADING AND ERROR HANDLERS
  if (isLoading) return <LoadingComponent type="screen" text="Loading..." />;
  if (error) return <ErrorComponent message={error.message} />;

  // Filter the food items based on the current filters
  const filteredItems = purchaseItems?.filter((item) => {
    // Filter by cuisine type
    if (
      filters.cuisine &&
      item?.purchase_items?.[0]?.menu_packages?.restaurant?.cuisine_type !==
        filters.cuisine
    ) {
      return false;
    }

    // Filter by category
    if (
      filters.category &&
      item?.purchase_items?.[0]?.menu_packages?.restaurant?.food_category !==
        filters.category
    ) {
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
        return (
          a?.purchase_items?.[0]?.menu_packages?.name || ""
        ).localeCompare(b?.purchase_items?.[0]?.menu_packages?.name || "");
      case "name_desc":
        return (
          b?.purchase_items?.[0]?.menu_packages?.name || ""
        ).localeCompare(a?.purchase_items?.[0]?.menu_packages?.name || "");
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
          <h3 className="text-lg text-center font-semibold text-gray-900 mb-2">
            {filters.category
              ? `No ${filters.category} purchased treats by Treaters found`
              : "No purchased treats by Treaters yet!"}
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            {filters.category
              ? "Try adjusting your filters or check back later for new purchased treats in this category."
              : "Try adjusting your filters or check back later for new purchased treats."}
          </p>
        </div>
      ) : (
        sortedItems?.map((item) => (
          <TreateeCard
            key={item.id}
            item={item}
            isLiked={false}
            onLike={() => {}}
          />
        ))
      )}
    </div>
  );
}
