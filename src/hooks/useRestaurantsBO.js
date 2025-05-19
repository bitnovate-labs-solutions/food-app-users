// FETCH RESTAURANTS + MENU PACKAGES + MENU IMAGES FROM BO DATABASE
import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";
import { useMenuPackages } from "./useMenuPackages";

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

// Transform menu packages data to restaurant-centric view
const transformToRestaurants = (menuPackages) => {
  const restaurantsMap = new Map();

  menuPackages.forEach((menuPackage) => {
    const restaurant = menuPackage.restaurant;
    if (!restaurantsMap.has(restaurant.id)) {
      restaurantsMap.set(restaurant.id, {
        ...restaurant,
        menu_packages: []
      });
    }
    restaurantsMap.get(restaurant.id).menu_packages.push({
      id: menuPackage.id,
      name: menuPackage.name,
      description: menuPackage.description,
      package_type: menuPackage.package_type,
      price: menuPackage.price,
      created_at: menuPackage.created_at,
      menu_images: menuPackage.menu_images
    });
  });

  return Array.from(restaurantsMap.values());
};

export const useRestaurantsBO = () => {
  const {
    data: menuPackages,
    error: menuError,
    isLoading: menuLoading,
    ...rest
  } = useMenuPackages();

  const restaurants = menuPackages 
    ? transformToRestaurants(menuPackages)
    : [];

  return {
    data: restaurants,
    error: menuError,
    isLoading: menuLoading,
    ...rest
  };
};
