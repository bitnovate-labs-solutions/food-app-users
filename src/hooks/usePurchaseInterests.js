import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Get interested users for a purchase (Fetches all users interested in a specific purchase)
// - Gets their profile information and images
// - Orders by most recent interest first
const getInterestedUsers = async (purchaseId) => {
  const { data, error } = await supabase
    .from("purchase_interests")
    .select(
      `
      *,
      treatee:user_profiles!purchase_interests_treatee_id_fkey(
        *,
        user_profile_images(
          id,
          image_url,
          is_primary
        )
      )
    `
    )
    .eq("purchase_id", purchaseId)
    .order("expressed_at", { ascending: false });

  if (error) throw error;
  return data || []; // Returns empty array if no data found
};

// Express interest in a purchase (Handles when a user expresses interest in a purchase)
const expressInterest = async ({ purchaseId, treateeId }) => {
  // Get the current user (Verifies the user is logged in)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;

  // Verify the user's profile
  const { data: userProfile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (profileError) throw profileError;

  // Verify the treatee_id matches the user's profile (Checks if the user's profile matches)
  if (userProfile.id !== treateeId) {
    throw new Error("Treatee ID does not match user profile");
  }

  // Insert the interest (Creates a new interest record)
  const { data, error } = await supabase
    .from("purchase_interests")
    .insert({
      purchase_id: purchaseId,
      treatee_id: treateeId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data; // Returns the created record
};

// React query hook to fetch interested users (for Treaters to see who's interested in their purchase)
export const useInterestedUsers = (purchaseId) => {
  const queryClient = useQueryClient();

  // Set up realtime subscription
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
        (payload) => {
          console.log("Purchase interest change received:", payload);
          // Invalidate and refetch
          queryClient.invalidateQueries(["interestedUsers", purchaseId]);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [purchaseId, queryClient]);

  return useQuery({
    queryKey: ["interestedUsers", purchaseId],
    queryFn: () => getInterestedUsers(purchaseId),
    enabled: !!purchaseId,
  });
};

// React query hook to express interest (to let a Treatee show interest in a Treater's purchase)
export const useExpressInterest = () => {
  const queryClient = useQueryClient();

  // Handles the mutation (data change)
  return useMutation({
    mutationFn: expressInterest,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["interestedUsers", variables.purchaseId]); // After success, refreshes the interested users list
      queryClient.invalidateQueries(["purchasedItems"]); // Also refreshes the purchases list to update counts
    },
  });
};
