import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useMenuPackages } from "./useMenuPackages";

/**
 * Hook to fetch statistics for a menu package in the explore view
 * @param {string} menuPackageId - The ID of the menu package
 * @returns {Object} Statistics including purchases, interests, and user avatars
 */
export function useExploreMenuPackageStats(menuPackageId) {
  // Get menu package details
  const {
    data: menuPackages,
    error: menuError,
    isLoading: menuLoading,
  } = useMenuPackages();

  const menuPackage = menuPackages?.find((mp) => mp.id === menuPackageId);

  // Fetch statistics
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["exploreMenuPackageStats", menuPackageId],
    queryFn: async () => {
      try {
        // Fetch all required data in parallel for better performance
        const [
          { data: purchaseItems, error: purchaseError },
          { data: interests, error: interestsError }
        ] = await Promise.all([
          // 1. Get purchase items and purchases in a single query
          supabase
            .from("purchase_items")
            .select(`
              id,
              purchase:purchases (
                id,
                user_id
              )
            `)
            .eq("package_id", menuPackageId),
          
          // 2. Get interests directly for this menu package without joining with purchases
          supabase
            .from("purchase_interests")
            .select(`
              id,
              treatee_id
            `)
            .eq("package_id", menuPackageId)
        ]);

        // Handle errors
        if (purchaseError) throw purchaseError;
        if (interestsError) throw interestsError;

        // Extract unique user IDs
        const treaterUserIds = [...new Set(purchaseItems.map(item => item.purchase?.user_id))].filter(Boolean);
        const treateeIds = [...new Set(interests.map(i => i.treatee_id))].filter(Boolean);

        // Fetch user profiles in parallel
        const [
          { data: treaterProfiles, error: treatersError },
          { data: treateeProfiles, error: treateeError }
        ] = await Promise.all([
          // Get treater profiles
          treaterUserIds.length > 0
            ? supabase
                .from("explore_card_stats")
                .select("user_id, user_profile_images")
                .in("user_id", treaterUserIds)
            : { data: [], error: null },
          
          // Get treatee profiles
          treateeIds.length > 0
            ? supabase
                .from("explore_card_stats")
                .select("id, user_profile_images")
                .in("id", treateeIds)
            : { data: [], error: null }
        ]);

        // Handle profile fetch errors
        if (treatersError) throw treatersError;
        if (treateeError) throw treateeError;

        return {
          purchaseItems,
          interests,
          treaterProfiles: treaterProfiles || [],
          treateeProfiles: treateeProfiles || [],
        };
      } catch (error) {
        console.error("Error fetching menu package stats:", error);
        throw error;
      }
    },
    enabled: !!menuPackageId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Extract unique avatars from profiles
   * @param {Array} profiles - Array of user profiles
   * @returns {Array} Array of unique avatar objects
   */
  const getUniqueAvatars = (profiles) => {
    const seen = new Map();
    profiles.forEach((p) => {
      const key = p.user_id || p.id;
      const avatar = p.user_profile_images?.[0]?.image_url;
      if (avatar && !seen.has(key)) {
        seen.set(key, { id: key, image_url: avatar });
      }
    });
    return Array.from(seen.values()).slice(0, 4);
  };

  // Combine all data
  const combinedData = menuPackage && statsData
    ? {
        // Menu package details
        menu_package_id: menuPackage.id,
        package_name: menuPackage.name,
        price: menuPackage.price,
        package_type: menuPackage.package_type,
        created_at: menuPackage.created_at,
        
        // Restaurant details
        restaurant_id: menuPackage.restaurant.id,
        restaurant_name: menuPackage.restaurant.name,
        location: menuPackage.restaurant.location,
        cuisine_type: menuPackage.restaurant.cuisine_type,
        food_category: menuPackage.restaurant.food_category,
        restaurant_image: menuPackage.restaurant.image_url,
        
        // Statistics
        total_purchases: statsData.purchaseItems.length,
        total_interests: new Set(statsData.interests.map(i => i.treatee_id)).size,
        treater_avatars: getUniqueAvatars(statsData.treaterProfiles),
        treatee_avatars: getUniqueAvatars(statsData.treateeProfiles),
      }
    : null;

  return {
    data: combinedData,
    error: menuError || statsError,
    isLoading: menuLoading || statsLoading,
  };
}
