import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";

const fetchRestaurants = async () => {
  // First, let's check if we can directly query menu_packages
  const { data: menuPackages, error: menuError } = await backOfficeSupabase
    .from("menu_packages")
    .select("*")
    .limit(5);

  console.log('Direct menu_packages query:', menuPackages);
  if (menuError) console.error('Menu packages query error:', menuError);

  // Now fetch restaurants with their menu packages
  const { data, error } = await backOfficeSupabase
    .from("restaurants")
    .select(
      `
      *,
      vendor:vendors (
        id,
        business_name,
        name,
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
      menu_packages (
        *,
        menu_images (*)
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  
  // Add detailed console logging
  console.log('Restaurants with menu packages:', data.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    menu_packages_count: restaurant.menu_packages?.length || 0,
    menu_packages: restaurant.menu_packages
  })));
  
  return data;
};

export const useRestaurantsBO = () => {
  return useQuery({
    queryKey: ["restaurantsBO"],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};
