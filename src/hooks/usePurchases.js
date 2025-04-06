import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const getPurchases = async () => {
  // First get all purchases
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      `*, 
        purchase_items (
            *,
            menu_packages (
              id,
              name,
              description,
              price,
              package_type,
              menu_images (
                id,
                image_url
              ),
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
            )
        )
    `
    )
    .order("created_at", { ascending: false });

  if (purchasesError) throw new Error(purchasesError.message);

  // Then get all user profiles of the Treaters for these purchases based on the user_id under purchases table
  const userIds = purchases.map((purchase) => purchase.user_id);
  const { data: userProfiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .in("user_id", userIds);

  if (profilesError) throw new Error(profilesError.message);

  // Combine the data
  return purchases.map((purchase) => ({
    ...purchase,
    user_profiles: userProfiles.filter(
      (profile) => profile.user_id === purchase.user_id
    ),
  }));
};

export const usePurchasedItems = () => {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchInterval: 1000 * 60, // Refresh every 1 minute instead of 30 seconds
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    suspense: true, // Enable React Suspense mode
    refetchOnWindowFocus: false, // Disable refetch on window focus
    select: (data) => {
      // Transform and filter data if needed
      return (
        data?.map((purchase) => ({
          ...purchase,
          purchase_items: purchase.purchase_items?.map((item) => ({
            ...item,
            menu_packages: item.menu_packages
              ? {
                  ...item.menu_packages,
                  menu_images: item.menu_packages.menu_images || [],
                }
              : null,
          })),
        })) || []
      );
    },
  });
};
