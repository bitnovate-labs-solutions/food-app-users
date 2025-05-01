// Hook to fetch only redeemed vouchers
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export const useRedeemedVouchers = () => {
  return useQuery({
    queryKey: ["redeemedVouchers"],
    queryFn: async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw new Error(userError.message);

      const { data, error } = await supabase
        .from("voucher_instances")
        .select(
          `
          id,
          redeemed_at,
          purchase_item_id,
          purchase_items (
            package_id,
            menu_packages (
              id,
              name,
              price,
              restaurant:restaurants (
                id,
                name
              )
            )
          )
        `
        )
        .eq("user_id", user.id)
        .eq("used", true)
        .order("redeemed_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 min fresh
    cacheTime: 1000 * 60 * 30, // 30 min cache
    refetchOnWindowFocus: false,
  });
};
