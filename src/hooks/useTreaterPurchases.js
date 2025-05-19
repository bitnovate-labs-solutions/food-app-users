import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";
import { useMenuPackages } from "./useMenuPackages";

// Fetch purchase data for menu packages
const fetchPurchaseData = async (menuPackageIds) => {
  if (!menuPackageIds.length) return [];

  const { data, error } = await backOfficeSupabase
    .from("purchase_items")
    .select(`
      *,
      purchase:purchases (
        id,
        created_at,
        status,
        treater:treater_profiles!inner (
          id,
          user_id,
          full_name,
          image_url
        )
      )
    `)
    .in("menu_package_id", menuPackageIds);

  if (error) throw new Error(error.message);
  return data;
};

// Fetch interest data for menu packages
const fetchInterestData = async (menuPackageIds) => {
  if (!menuPackageIds.length) return [];

  const { data, error } = await backOfficeSupabase
    .from("interests")
    .select(`
      *,
      treatee:treatee_profiles!inner (
        id,
        user_id,
        full_name,
        image_url
      )
    `)
    .in("menu_package_id", menuPackageIds);

  if (error) throw new Error(error.message);
  return data;
};

// Combine menu packages with purchase and interest data
const combineData = (menuPackages, purchases, interests) => {
  return menuPackages.map((menuPackage) => ({
    ...menuPackage,
    purchases: purchases.filter((p) => p.menu_package_id === menuPackage.id),
    interests: interests.filter((i) => i.menu_package_id === menuPackage.id),
  }));
};

export const useTreaterPurchases = () => {
  const {
    data: menuPackages,
    error: menuError,
    isLoading: menuLoading,
    ...rest
  } = useMenuPackages();

  // Fetch purchase and interest data when menu packages are loaded
  const { data: purchaseData, error: purchaseError } = useQuery({
    queryKey: ["purchases", menuPackages?.map(mp => mp.id)],
    queryFn: () => fetchPurchaseData(menuPackages?.map(mp => mp.id) || []),
    enabled: !!menuPackages?.length,
    staleTime: 1000 * 30, // 30 seconds - purchase data changes frequently
    cacheTime: 1000 * 60 * 5, // 5 minutes - shorter cache time since it's more dynamic
    refetchOnWindowFocus: true, // Refetch on focus to get latest purchase status
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
  });

  const { data: interestData, error: interestError } = useQuery({
    queryKey: ["interests", menuPackages?.map(mp => mp.id)],
    queryFn: () => fetchInterestData(menuPackages?.map(mp => mp.id) || []),
    enabled: !!menuPackages?.length,
    staleTime: 1000 * 30, // 30 seconds - interest data changes frequently
    cacheTime: 1000 * 60 * 5, // 5 minutes - shorter cache time since it's more dynamic
    refetchOnWindowFocus: true, // Refetch on focus to get latest interests
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
  });

  const combinedData = menuPackages && purchaseData && interestData
    ? combineData(menuPackages, purchaseData, interestData)
    : [];

  return {
    data: combinedData,
    error: menuError || purchaseError || interestError,
    isLoading: menuLoading,
    ...rest
  };
};
