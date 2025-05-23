import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMenuPackages } from "./useMenuPackages";

// Separate query functions for better error handling and reusability
const fetchPurchases = async () => {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `*, 
        purchase_items!inner (
          *,
          package_id
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch purchases: ${error.message}`);
  if (!data) throw new Error("No purchases data received");
  return data;
};

// Fetches ALL records from the purchase_interests table
const fetchPurchaseInterests = async () => {
  const { data, error } = await supabase
    .from("purchase_interests")
    .select(
      `
      *,
      treatee:user_profiles!purchase_interests_treatee_id_fkey(
        id,
        user_id
      )
    `
    );

  if (error) throw new Error(`Failed to fetch purchase interests: ${error.message}`);
  if (!data) throw new Error("No purchase interests data received");
  return data;
};

const fetchUserProfiles = async (userIds) => {
  if (!userIds.length) return [];

  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      *,
      user_profile_images!inner(
        id, 
        image_url,
        is_primary,
        position,
        scale,
        rotation,
        order
      )
    `
    )
    .in("user_id", userIds);

  if (error) throw new Error(`Failed to fetch user profiles: ${error.message}`);
  if (!data) throw new Error("No user profiles data received");
  return data;
};

// Main data fetching function with parallel queries
const getTreaterPurchases = async (menuPackages) => {
  try {
    if (!menuPackages?.length) return [];

    // Fetch all data in parallel
    const [purchases, purchaseInterests] = await Promise.all([
      fetchPurchases(),
      fetchPurchaseInterests(),
    ]);

    // Get unique user IDs and fetch profiles
    const userIds = [...new Set(purchases.map((purchase) => purchase.user_id))];
    const userProfiles = await fetchUserProfiles(userIds);

    // Create optimized lookup maps
    const userProfilesMap = new Map(
      userProfiles.map((profile) => [profile.user_id, profile])
    );

    // Create a map of purchase items by package_id for faster lookups
    const purchaseItemsByPackage = new Map();
    purchases.forEach((purchase) => {
      purchase.purchase_items.forEach((item) => {
        if (!purchaseItemsByPackage.has(item.package_id)) {
          purchaseItemsByPackage.set(item.package_id, []);
        }
        purchaseItemsByPackage.get(item.package_id).push({
          ...item,
          purchase: {
            id: purchase.id,
            user_id: purchase.user_id,
            created_at: purchase.created_at,
            status: purchase.status,
            total_price: purchase.total_price,
            image_url: purchase.image_url,
            purchased_at: purchase.purchased_at,
          },
        });
      });
    });

    // Create a map of unique treatees by package_id
    const uniqueTreateesByPackage = new Map();
    purchaseInterests.forEach((interest) => {
      if (!uniqueTreateesByPackage.has(interest.package_id)) {
        uniqueTreateesByPackage.set(interest.package_id, new Set());
      }
      // Add treatee_id to the Set to ensure uniqueness
      uniqueTreateesByPackage.get(interest.package_id).add(interest.treatee_id);
    });

    // Create a map of all interests by package_id for detailed info
    const interestsByPackage = new Map();
    purchaseInterests.forEach((interest) => {
      if (!interestsByPackage.has(interest.package_id)) {
        interestsByPackage.set(interest.package_id, []);
      }
      interestsByPackage.get(interest.package_id).push(interest);
    });

    // Process menu packages with optimized lookups
    return menuPackages.map((menuPackage) => {
      const packageItems = purchaseItemsByPackage.get(menuPackage.id) || [];
      const packageInterests = interestsByPackage.get(menuPackage.id) || [];
      const uniqueTreatees = uniqueTreateesByPackage.get(menuPackage.id) || new Set();
      
      // Get unique treaters using Set for deduplication
      const uniqueTreaterIds = new Set();
      const treaters = packageItems
        .map((item) => userProfilesMap.get(item.purchase.user_id))
        .filter(Boolean)
        .filter((treater) => {
          if (uniqueTreaterIds.has(treater.user_id)) return false;
          uniqueTreaterIds.add(treater.user_id);
          return true;
        });

      return {
        ...menuPackage,
        user_profiles: treaters,
        purchase_interests: packageInterests,
        purchase_items: packageItems,
        total_treatee_count: uniqueTreatees.size, // Count unique treatees
      };
    });
  } catch (error) {
    console.error("Error in getTreaterPurchases:", error);
    throw error;
  }
};

// How Interests are Counted?
// - By counting all interests for a package
// - The usePurchaseInterests hook provides real-time updates through Supabase's real-time subscriptions
// - When a treatee expresses interest, it's handled by the useExpressInterest hook

// Optimized hook with better caching and error handling
export const useTreaterPurchases = () => {
  const { data: menuPackages } = useMenuPackages();

  return useQuery({
    queryKey: ["menuPackagesWithTreaters", menuPackages?.map(mp => mp.id)],
    queryFn: () => getTreaterPurchases(menuPackages),
    enabled: !!menuPackages?.length,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: 2, // Retry failed requests twice
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onError: (error) => {
      console.error("Error in useTreaterPurchases:", error);
    },
  });
};
