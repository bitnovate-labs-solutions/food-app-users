// Custom hook (For fetching a SINGLE USER)
// More efficient for performance as:
// React Query automatically caches the profile data - reduces server load by reusing cached data,
// Deduplication - prevents redundant API calls (multiple requests for the same data),
// Handles automatic background updates - auto refresh data,
// Shared state - profile data is shared across components
// Error handling - built-in error handling and retry logic
// Loading state - automatic loading state management

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useUserProfile(authUser) {
  const fetchProfile = async () => {
    if (!authUser?.id) return null;

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
      .eq("user_id", authUser.id)
      .single();

    if (error) {
      // PGRST116 means no profile found - this is expected for new users
      if (error.code === "PGRST116") {
        console.log("No profile found for new user");
        return null;
      }
      console.error("Profile fetch error:", error);
      throw error;
    }

    return data;
  };

  return useQuery({
    queryKey: ["profile", authUser?.id],
    queryFn: fetchProfile,
    enabled: !!authUser?.id,
    retry: false, // Don't retry on error for new users
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    suspense: true,
  });
}
