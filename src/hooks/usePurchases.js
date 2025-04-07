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

  // Get all purchase interests
  const { data: purchaseInterests, error: interestsError } = await supabase
    .from("purchase_interests")
    .select("*");

  if (interestsError) throw new Error(interestsError.message);

  // Then get all user profiles of the Treaters for these purchases
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

  // Group purchases by menu package
  const groupedPurchases = purchases.reduce((acc, purchase) => {
    purchase.purchase_items.forEach((item) => {
      const menuPackageId = item.menu_packages.id;
      const existingGroup = acc.find(group => group.menuPackageId === menuPackageId);

      // Get interests for this purchase
      const interests = purchaseInterests?.filter(interest => interest.purchase_id === purchase.id) || [];

      if (existingGroup) {
        // Add this purchase's user to the treaters list if not already included
        const treaterProfile = userProfiles.find(profile => profile.user_id === purchase.user_id);
        if (treaterProfile && !existingGroup.user_profiles.some(p => p.user_id === treaterProfile.user_id)) {
          existingGroup.user_profiles.push(treaterProfile);
        }
        // Update the total quantity
        existingGroup.purchase_items[0].quantity += item.quantity;
        // Update the total likes
        existingGroup.likes = (existingGroup.likes || 0) + (purchase.likes || 0);
        // Keep the most recent purchase date
        if (new Date(purchase.created_at) > new Date(existingGroup.created_at)) {
          existingGroup.created_at = purchase.created_at;
        }
        // Merge purchase interests
        existingGroup.purchase_interests = [
          ...(existingGroup.purchase_interests || []),
          ...interests
        ];
      } else {
        // Create new group
        const treaterProfile = userProfiles.find(profile => profile.user_id === purchase.user_id);
        acc.push({
          ...purchase,
          menuPackageId,
          user_profiles: treaterProfile ? [treaterProfile] : [],
          purchase_items: [{
            ...item,
            quantity: item.quantity
          }],
          likes: purchase.likes || 0,
          purchase_interests: interests
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
  });
};
