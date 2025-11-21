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

    // Get app_users record
    const { data: appUserData, error: appUserError } = await supabase
      .from("app_users")
      .select("*")
      .eq("profile_id", authUser.id)
      .single();

    if (appUserError) {
      // PGRST116 means no profile found - this is expected for new users
      if (appUserError.code === "PGRST116") {
        console.log("No app_users record found for new user");
        return null;
      }
      console.error("Profile fetch error:", appUserError);
      throw appUserError;
    }

    // Get profile data from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, display_name, email, phone_number, profile_image_url")
      .eq("id", authUser.id)
      .single();

    // If profile doesn't exist in profiles table, it's okay - we'll still return app_users data
    // profileError with code PGRST116 means no rows found, which is acceptable
    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile from profiles table:", profileError);
    }

    // Combine the data - always include profile data if available
    const data = {
      ...appUserData,
      profile: profileError && profileError.code === "PGRST116" ? null : profileData,
    };

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
