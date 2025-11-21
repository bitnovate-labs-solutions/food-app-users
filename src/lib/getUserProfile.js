// REUSABLE HELPER FUNCTION FOR:
// Fetching the CURRENTLY LOGGED-IN(authenticated) user and their corresponding profile.
// Throws an error if user is not authenticated or if profile doesn't exist.
// USAGE:
// use this in any logic that depends on:
// Authenticated user
// Their role
// Their internal profile ID

import { supabase } from "@/lib/supabase";

export const getCurrentUserProfile = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw authError || new Error("User not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("app_users")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (profileError || !profile) {
    throw profileError || new Error("User profile not found");
  }

  return { user, profile };
};
