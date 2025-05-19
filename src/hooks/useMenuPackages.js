import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";

const fetchMenuPackages = async () => {
  const { data, error } = await backOfficeSupabase
    .from("menu_packages")
    .select(
      `
      *,
      menu_images (*),
      restaurant:restaurants!inner (
        id,
        name,
        location,
        address,
        phone_number,
        image_url,
        cuisine_type,
        food_category
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Log the fetched data
  console.log("📦 Menu Packages Fetched:", {
    total: data.length,
    packages: data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      restaurant: pkg.restaurant?.name,
      location: pkg.restaurant?.location,
      cuisine: pkg.restaurant?.cuisine_type,
      category: pkg.restaurant?.food_category,
      images: pkg.menu_images?.length || 0,
      created_at: pkg.created_at
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
      console.log("✅ Menu Packages Query Success:", {
        timestamp: new Date().toISOString(),
        totalPackages: data.length,
        restaurants: [...new Set(data.map(pkg => pkg.restaurant?.name))].filter(Boolean),
        cuisines: [...new Set(data.map(pkg => pkg.restaurant?.cuisine_type))].filter(Boolean),
        categories: [...new Set(data.map(pkg => pkg.restaurant?.food_category))].filter(Boolean)
      });
    }
  });
}; 