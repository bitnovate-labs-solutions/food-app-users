import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function usePotentialMatches(userId, swipedUsers = []) {
  const fetchPotentialMatches = async () => {
    if (!userId) return [];

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
      .neq("user_id", userId)
      .not("user_id", "in", `(${swipedUsers.join(",")})`);

    if (error) throw error;
    return data || [];
  };

  return useQuery({
    queryKey: ["potentialMatches", userId, swipedUsers],
    queryFn: fetchPotentialMatches,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
} 