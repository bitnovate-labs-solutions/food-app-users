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
  
  return data;
};

export const useMenuPackagesBO = () => {
  return useQuery({
    queryKey: ["menuPackagesBO"],
    queryFn: fetchMenuPackages,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}; 