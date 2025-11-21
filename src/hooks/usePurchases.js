import { supabase } from "@/lib/supabase";
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
  // purchases.user_id references profiles.id (which equals auth.users.id)
  const userIds = validPurchases.map((purchase) => purchase.user_id);
  
  // Get app_users records
  const { data: appUsers, error: appUsersError } = await supabase
    .from("app_users")
    .select("*")
    .in("profile_id", userIds);

  if (appUsersError) throw new Error(appUsersError.message);

  // Get profiles to get display_name
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, email, phone_number, profile_image_url")
    .in("id", userIds);

  if (profilesError) throw new Error(profilesError.message);

  // Merge app_users with profiles data
  const userProfiles = (appUsers || []).map(appUser => {
    const profile = (profiles || []).find(p => p.id === appUser.profile_id);
    return {
      ...appUser,
      display_name: profile?.display_name,
      email: profile?.email,
      phone_number: profile?.phone_number,
      profile_image_url: profile?.profile_image_url,
    };
  });

  // Get all menu items from back office database
  const packageIds = validPurchases.flatMap((purchase) =>
    purchase.purchase_items.map((item) => item.package_id)
  );

  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select(
      `
      id,
      name,
      description,
      price,
      image_url,
      is_available,
      category,
      restaurant:restaurants!inner (
        id,
        name,
        address,
        hours,
        phone_number,
        image_url, 
        cuisine_type,
        food_category,
        latitude,
        longitude
      )
    `
    )
    .in("id", packageIds);

  if (menuError) throw new Error(menuError.message);

  // Create a map of menu items for easy lookup
  const menuItemMap = menuItems.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  // Group purchases by menu item
  const groupedPurchases = validPurchases.reduce((acc, purchase) => {
    purchase.purchase_items.forEach((item) => {
      const menuItem = menuItemMap[item.package_id];
      if (!menuItem) return; // Skip if menu item not found

      const menuItemId = menuItem.id;
      const existingGroup = acc.find(
        (group) => group.menuItemId === menuItemId
      );

      // Get interests for this purchase
      const interests =
        purchaseInterests?.filter(
          (interest) => interest.purchase_id === purchase.id
        ) || [];

      if (existingGroup) {
        // Add this purchase's user to the treaters list if not already included
        const treaterProfile = userProfiles.find(
          (profile) => profile.profile_id === purchase.user_id
        );
        if (
          treaterProfile &&
          !existingGroup.user_profiles.some(
            (p) => p.profile_id === treaterProfile.profile_id
          )
        ) {
          existingGroup.user_profiles.push(treaterProfile);
        }

        // Find the existing purchase item for this menu item
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
            menu_item: menuItem,
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
          (profile) => profile.profile_id === purchase.user_id
        );
        acc.push({
          ...purchase,
          menuItemId,
          user_profiles: treaterProfile ? [treaterProfile] : [],
          purchase_items: [
            {
              ...item,
              menu_item: menuItem,
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
