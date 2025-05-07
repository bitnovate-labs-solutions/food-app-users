// FETCH RESTAURANTS + MENU PACKAGES + MENU IMAGES FROM BO DATABASE
import { useQuery } from "@tanstack/react-query";
import { backOfficeSupabase } from "@/lib/supabase-bo";

const fetchPromoVouchers = async () => {
  const { data, error } = await backOfficeSupabase
    .from("vouchers")
    .select(`*`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching promo vouchers:", error);
    throw new Error("Failed to load promo vouchers");
  }

  // Add detailed console logging
  //   console.log(
  //     "✅ vouchers fetched with menu packages:",
  //     data.map((r) => ({
  //       id: r.id,
  //       name: r.name,
  //       menuCount: r.menu_packages?.length || 0,
  //       menu_packages: r.menu_packages,
  //     }))
  //   );

  return data;
};

export const usePromoVouchers = () => {
  return useQuery({
    queryKey: ["promoVouchersBO"],
    queryFn: fetchPromoVouchers,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
  });
};
