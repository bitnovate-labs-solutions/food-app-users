import { getCurrentUserProfile } from "@/lib/getUserProfile";
import { supabase } from "@/lib/supabase";
import { backOfficeSupabase } from "@/lib/supabase-bo";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

// Combined fetch function
export const getRedeemedVouchersWithMenu = async () => {
  const { user, profile } = await getCurrentUserProfile();
  if (!profile) throw new Error("User not authenticated");

  // Fetch both in parallel
  const [menuPackagesResult, voucherInstancesResult] = await Promise.all([
    backOfficeSupabase
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
      .order("created_at", { ascending: false }),

    supabase
      .from("voucher_instances")
      .select(
        `
        *,
        purchase_item_id:purchase_items!inner (
          *,
          package_id,
          expiry_date
        )
      `
      )
      .eq("user_id", user.id)
      .or(`used.eq.true,expiry_date.lt.${dayjs().toISOString()}`)
      .order("redeemed_at", { ascending: false }),
  ]);

  const { data: menuPackages, error: menuError } = menuPackagesResult;
  const { data: vouchers, error: voucherError } = voucherInstancesResult;

  if (menuError) throw new Error(menuError.message);
  if (voucherError) throw new Error(voucherError.message);

  // Merge: attach full menu_package to each voucher using purchase_items.package_id
  const enrichedVouchers = vouchers.map((voucher) => {
    const packageId = voucher.purchase_item_id?.package_id;
    const matchedPackage = menuPackages.find((pkg) => pkg.id === packageId);
    return {
      ...voucher,
      menu_package: matchedPackage || null,
      expiry_date: voucher.purchase_item_id?.expiry_date,
    };
  });

  return enrichedVouchers;
};

// Hook to use in your component
export const useRedeemedVouchers = () => {
  return useQuery({
    queryKey: ["redeemedVouchers"],
    queryFn: getRedeemedVouchersWithMenu,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
};
