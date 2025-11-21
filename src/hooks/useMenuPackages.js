import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchMenuPackages = async () => {
  const { data, error } = await supabase
    .from("menu_items")
    .select(
      `
      *,
      restaurant:restaurants!inner (
        id,
        name,
        address,
        hours,
        phone_number,
        image_url,
        cuisine_type,
        food_category,
        latitude,
        longitude
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Log the fetched data
  console.log("📦 Menu Items Fetched:", {
    total: data.length,
    packages: data.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurant: item.restaurant?.name,
      address: item.restaurant?.address,
      cuisine: item.restaurant?.cuisine_type,
      category: item.restaurant?.food_category,
      image_url: item.image_url,
      created_at: item.created_at
    }))
  });

  return data;
};

export const useMenuPackages = () => {
  return useQuery({
    queryKey: ["menuPackages"],
    queryFn: fetchMenuPackages,
    staleTime: 1000 * 60 * 2, // 2 minutes - menu packages can change more frequently
    cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache for a while since it's used across components
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Refetch when component mounts to ensure fresh data
    refetchOnReconnect: true, // Refetch when reconnecting to ensure fresh data
    onSuccess: (data) => {
      // Log when data is successfully fetched and cached
      console.log("✅ Menu Items Query Success:", {
        timestamp: new Date().toISOString(),
        totalItems: data.length,
        restaurants: [...new Set(data.map(item => item.restaurant?.name))].filter(Boolean),
        cuisines: [...new Set(data.map(item => item.restaurant?.cuisine_type))].filter(Boolean),
        categories: [...new Set(data.map(item => item.category))].filter(Boolean)
      });
    }
  });
}; 