// FETCH PROMOTIONS FROM BACK OFFICE DATABASE
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchPromotions = async () => {
  const now = new Date().toISOString();

  // Fetch active promotions that are within date range
  let query = supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Filter by date range: start_date <= now AND (end_date IS NULL OR end_date >= now)
  const { data, error } = await query;

  if (error) {
    console.error("❌ Error fetching promotions:", error);
    throw new Error("Failed to load promotions");
  }

  // Filter by date range in JavaScript (more reliable than complex SQL)
  const filtered = (data || []).filter((promo) => {
    const startValid = !promo.start_date || new Date(promo.start_date) <= new Date(now);
    const endValid = !promo.end_date || new Date(promo.end_date) >= new Date(now);
    return startValid && endValid;
  });

  // Filter by target_audience: show "all_users" or null (for all users)
  return filtered.filter(
    (promo) => !promo.target_audience || promo.target_audience === "all_users"
  );
};

export const usePromotions = () => {
  return useQuery({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

