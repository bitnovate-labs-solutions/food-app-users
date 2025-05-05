import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";
import { supabase } from "@/lib/supabase";

const getTreaterPurchases = async () => {
  // FETCH ALL PURCHASES FROM PWA DATABASE ----------------------------------------
  const { data: purchases, error: purchasesError } = await supabase
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

  if (purchasesError) throw new Error(purchasesError.message);

  // FETCH MENU PACKAGES FROM BACK OFFICE DATABASE ----------------------------------------
  const { data: menuPackages, error: menuError } = await backOfficeSupabase
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

  if (menuError) throw new Error(menuError.message);

  // FETCH ALL PURCHASE INTERESTS ----------------------------------------
  const { data: purchaseInterests, error: interestsError } = await supabase
    .from("purchase_interests")
    .select("*");

  if (interestsError) throw new Error(interestsError.message);

  // FETCH ALL USER PROFILES OF THE TREATERS FOR THESE PURCHASES ----------------------------------------
  const userIds = purchases.map((purchase) => purchase.user_id);

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

  // GROUP PURCHASES BY MENU PACKAGES ----------------------------------------
  const menuPackagesWithTreaters = menuPackages.map((menuPackage) => {
    // Find all purchases for this menu package
    const packagePurchases = purchases.filter((purchase) =>
      purchase.purchase_items.some((item) => item.package_id === menuPackage.id)
    );

    // Collect all relevant purchase_items for this package
    const purchaseItems = packagePurchases.flatMap((purchase) =>
      purchase.purchase_items.filter(
        (item) => item.package_id === menuPackage.id
      )
    );

    // Get all treaters (user_profiles) for this package (deduplicated by user_id)
    const uniqueTreaterIds = new Set();
    const treaters = packagePurchases
      .map((purchase) => {
        const treaterProfile = userProfiles.find(
          (profile) => profile.user_id === purchase.user_id
        );
        return treaterProfile;
      })
      .filter(Boolean)
      .filter((treater) => {
        if (uniqueTreaterIds.has(treater.user_id)) {
          return false;
        }
        uniqueTreaterIds.add(treater.user_id);
        return true;
      });

    // FILTER ALL INTERESTS FOR THIS PACKAGE'S PURCHASES & INCLUDE ONLY THAT INTEREST IF ITS PURCHASE HAS A PURCHASE_ITEM FOR THE CURRENT menuPackage.id
    const relevantPurchaseIds = packagePurchases.map((p) => p.id); // This ensures you're only counting interests tied to that package and its specific purchases, avoiding shared-count bugs.

    const interests = purchaseInterests.filter(
      (interest) =>
        interest.package_id === menuPackage.id &&
        relevantPurchaseIds.includes(interest.purchase_id)
    );

    return {
      ...menuPackage,
      user_profiles: treaters,
      purchase_interests: interests,
      purchase_items: purchaseItems,
    };
  });

  return menuPackagesWithTreaters;
};

export const useTreaterPurchases = () => {
  return useQuery({
    queryKey: ["menuPackagesWithTreaters"],
    queryFn: getTreaterPurchases,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};
