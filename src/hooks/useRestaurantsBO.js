// FETCH RESTAURANTS + MENU ITEMS FROM BO DATABASE
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const fetchRestaurants = async () => {
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      `
      *,
      vendor:vendors (
        id,
        business_name,
        contact_name,
        email,
        phone,
        business_logo_url,
        website,
        social_links,
        business_address,
        city,
        state,
        country,
        payment_details,
        verified_status
      ),
      menu_items (
        id,
        name,
        description,
        price,
        image_url,
        is_available,
        average_rating,
        created_at,
        category
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching restaurants:", error);
    throw new Error("Failed to load restaurants");
  }

  // Add detailed console logging
  console.log(
    "✅ Restaurants fetched with menu items:",
    data.map((r) => ({
      id: r.id,
      name: r.name,
      menuCount: r.menu_items?.length || 0,
      menu_items: r.menu_items,
    }))
  );

  return data;
};

export const useRestaurantsBO = () => {
  const queryClient = useQueryClient();

  // Set up Realtime subscription to listen for menu_items changes
  useEffect(() => {
    const channel = supabase
      .channel("restaurants-menu-items-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "menu_items",
        },
        (payload) => {
          console.log("📦 Menu item change detected:", payload.eventType);
          // Invalidate restaurants cache to refetch with new menu items
          queryClient.invalidateQueries({ queryKey: ["restaurantsBO"] });
          // Also invalidate menu packages cache
          queryClient.invalidateQueries({ queryKey: ["menuPackages"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*", // Also listen to restaurant changes
          schema: "public",
          table: "restaurants",
        },
        (payload) => {
          console.log("🏪 Restaurant change detected:", payload.eventType);
          queryClient.invalidateQueries({ queryKey: ["restaurantsBO"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["restaurantsBO"],
    queryFn: fetchRestaurants,
    staleTime: 0, // Always consider data stale to ensure fresh data on mount/refresh
    cacheTime: 1000 * 60 * 2, // Keep in cache for 2 minutes (reduced from 5)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnReconnect: true, // Refetch when reconnecting
    // Removed refetchInterval - using Realtime instead for better performance
  });
};
