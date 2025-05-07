// FETCH RESTAURANTS + MENU PACKAGES + MENU IMAGES FROM BO DATABASE
import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";

const fetchRestaurants = async () => {
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
        id,
        name,
        description,
        package_type,
        price,
        created_at,
        menu_images (
          id, 
          image_url
        )
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
    "✅ Restaurants fetched with menu packages:",
    data.map((r) => ({
      id: r.id,
      name: r.name,
      menuCount: r.menu_packages?.length || 0,
      menu_packages: r.menu_packages,
    }))
  );

  return data;
};

export const useRestaurantsBO = () => {
  return useQuery({
    queryKey: ["restaurantsBO"],
    queryFn: fetchRestaurants,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
  });
};
