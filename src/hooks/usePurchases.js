import { supabase } from "@/lib/supabase";
import { backOfficeSupabase } from "@/lib/supabase-bo";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const getPurchases = async () => {
  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("User must be logged in");

  // First get all purchases for the current user
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select(
      `*, 
        purchase_items!inner (
            *,
            package_id,
            voucher_instances (*),
            expiry_date
        )
    `
    )
    .order("created_at", { ascending: false });

  if (purchasesError) throw new Error(purchasesError.message);

  // Filter out expired purchases at the data level
  const validPurchases = purchases.filter(purchase => {
    const purchaseItem = purchase.purchase_items?.[0];
    if (!purchaseItem) return false;
    
    const expiryDate = purchaseItem.expiry_date;
    const isExpired = expiryDate && dayjs(expiryDate).isBefore(dayjs());
    const hasUnusedVouchers = purchaseItem.voucher_instances?.some(v => !v.used);
    
    // Keep only purchases that are not expired and have unused vouchers
    return !isExpired && hasUnusedVouchers;
  });

  // Get all purchase interests
  const { data: purchaseInterests, error: interestsError } = await supabase
    .from("purchase_interests")
    .select("*");

  if (interestsError) throw new Error(interestsError.message);

  // Then get all user profiles of the Treaters for these purchases
  const userIds = validPurchases.map((purchase) => purchase.user_id);
  const { data: userProfiles, error: profilesError } = await supabase
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

  if (profilesError) throw new Error(profilesError.message);

  // Get all menu packages from back office database
  const packageIds = validPurchases.flatMap((purchase) =>
    purchase.purchase_items.map((item) => item.package_id)
  );

  const { data: menuPackages, error: menuError } = await backOfficeSupabase
    .from("menu_packages")
    .select(
      `
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
    `
    )
    .in("id", packageIds);

  if (menuError) throw new Error(menuError.message);

  // Create a map of menu packages for easy lookup
  const menuPackageMap = menuPackages.reduce((acc, pkg) => {
    acc[pkg.id] = pkg;
    return acc;
  }, {});

  // Group purchases by menu package
  const groupedPurchases = validPurchases.reduce((acc, purchase) => {
    purchase.purchase_items.forEach((item) => {
      const menuPackage = menuPackageMap[item.package_id];
      if (!menuPackage) return; // Skip if menu package not found

      const menuPackageId = menuPackage.id;
      const existingGroup = acc.find(
        (group) => group.menuPackageId === menuPackageId
      );

      // Get interests for this purchase
      const interests =
        purchaseInterests?.filter(
          (interest) => interest.purchase_id === purchase.id
        ) || [];

      if (existingGroup) {
        // Add this purchase's user to the treaters list if not already included
        const treaterProfile = userProfiles.find(
          (profile) => profile.user_id === purchase.user_id
        );
        if (
          treaterProfile &&
          !existingGroup.user_profiles.some(
            (p) => p.user_id === treaterProfile.user_id
          )
        ) {
          existingGroup.user_profiles.push(treaterProfile);
        }

        // Find the existing purchase item for this package
        const existingItem = existingGroup.purchase_items.find(
          (pi) => pi.package_id === item.package_id
        );

        if (existingItem) {
          // Update the quantity by adding the new quantity
          existingItem.quantity =
            (existingItem.quantity || 0) + (item.quantity || 0);
          // Merge voucher instances
          existingItem.voucher_instances = [
            ...(existingItem.voucher_instances || []),
            ...(item.voucher_instances || []),
          ];
        } else {
          // Add new purchase item if it doesn't exist
          existingGroup.purchase_items.push({
            ...item,
            menu_packages: menuPackage,
            quantity: item.quantity || 0,
            voucher_instances: item.voucher_instances || [],
          });
        }

        // Update the total likes
        existingGroup.likes =
          (existingGroup.likes || 0) + (purchase.likes || 0);
        // Keep the most recent purchase date
        if (
          new Date(purchase.created_at) > new Date(existingGroup.created_at)
        ) {
          existingGroup.created_at = purchase.created_at;
        }
        // Merge purchase interests
        existingGroup.purchase_interests = [
          ...(existingGroup.purchase_interests || []),
          ...interests,
        ];
      } else {
        // Create new group
        const treaterProfile = userProfiles.find(
          (profile) => profile.user_id === purchase.user_id
        );
        acc.push({
          ...purchase,
          menuPackageId,
          user_profiles: treaterProfile ? [treaterProfile] : [],
          purchase_items: [
            {
              ...item,
              menu_packages: menuPackage,
              quantity: item.quantity || 0,
              voucher_instances: item.voucher_instances || [],
            },
          ],
          likes: purchase.likes || 0,
          purchase_interests: interests,
        });
      }
    });
    return acc;
  }, []);

  return groupedPurchases;
};

export const usePurchasedItems = () => {
  return useQuery({
    queryKey: ["purchasedItems"],
    queryFn: getPurchases,
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep unused data in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts to ensure fresh data
  });
};
