// USAGE:
// For expressing interest in a specific purchase, and
// Treaters can view those interested users in real-time.
// ===============================================================================================
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/getUserProfile";

// ===============================================================================================
// FETCH ALL TREATEES WHO EXPRESSED INTEREST IN A PURCHASE
const getInterestedUsers = async (purchaseId, packageId) => {
  const { data, error } = await supabase
    .from("purchase_interests")
    .select(
      `
      *,
      treatee:app_users!purchase_interests_treatee_id_fkey(*)
    `
    )
    .eq("purchase_id", purchaseId)
    .eq("package_id", packageId)
    .order("expressed_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Get profile_ids from treatees
  const profileIds = data
    .map(interest => interest.treatee?.profile_id)
    .filter(Boolean);

  if (profileIds.length === 0) return data;

  // Fetch profiles to get display_name
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, email, phone_number, profile_image_url")
    .in("id", profileIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return data; // Return data without profiles if fetch fails
  }

  // Merge treatee data with profiles
  return data.map(interest => {
    if (interest.treatee) {
      const profile = profiles?.find(p => p.id === interest.treatee.profile_id);
      return {
        ...interest,
        treatee: {
          ...interest.treatee,
          display_name: profile?.display_name || interest.treatee.display_name,
          email: profile?.email || interest.treatee.email,
          phone_number: profile?.phone_number || interest.treatee.phone_number,
          profile_image_url: profile?.profile_image_url || interest.treatee.profile_image_url,
        },
      };
    }
    return interest;
  });
};

// ===============================================================================================
// HANDLE EXPRESS INTEREST (Handles when a user expresses interest in a purchase)
const expressInterest = async ({ purchaseId, treateeId, packageId }) => {
  // Get the current user (Verifies the user is logged in)
  const { profile } = await getCurrentUserProfile();

  // Verify the treatee_id matches the user's profile (Checks if the user's profile matches)
  if (profile.id !== treateeId) {
    throw new Error("Treatee ID does not match user profile");
  }

  // Insert the interest (Creates a new interest record)
  const { data, error } = await supabase
    .from("purchase_interests")
    .insert({
      purchase_id: purchaseId,
      treatee_id: treateeId,
      package_id: packageId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data; // Returns the created record
};

// ===============================================================================================
// HOOK - FETCHES INTERESTED USERS WHO EXPRESSED INTEREST IN A SPECIFIC PURCHASE AND PACKAGE WITH LIVE UPDATES
export const useInterestedUsers = (purchaseId, packageId) => {
  const queryClient = useQueryClient();

  // Set up realtime subscription to auto-update the data if someone expresses interest
  useEffect(() => {
    if (!purchaseId) return;

    // Create a channel for this purchase's interests
    const channel = supabase
      .channel(`purchase-interests-${purchaseId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "purchase_interests",
          filter: `purchase_id=eq.${purchaseId}`,
        },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries([
            "interestedUsers",
            purchaseId,
            packageId,
          ]);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [purchaseId, packageId, queryClient]);

  return useQuery({
    queryKey: ["interestedUsers", purchaseId, packageId],
    queryFn: () => getInterestedUsers(purchaseId, packageId),
    enabled: !!purchaseId && !!packageId,
  });
};

// ===============================================================================================
// HOOK - FOR TREATEE TO EXPRESS THEIR INTEREST, VALIDATES THAT THE LOGGED-IN USER IS A TREATEE, INSERTS A NEW ROW INTO THE purchase_interests table
export const useExpressInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expressInterest,
    onSuccess: (_, variables) => {
      // Upon success, refreshes the interested users list and purchase_items list
      queryClient.invalidateQueries(["interestedUsers", variables.purchaseId]);
      queryClient.invalidateQueries(["purchasedItems"]);
    },
  });
};
