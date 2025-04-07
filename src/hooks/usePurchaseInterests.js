import { supabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get interested users for a purchase
const getInterestedUsers = async (purchaseId) => {
  const { data, error } = await supabase
    .from("purchase_interests")
    .select(`
      *,
      treatee:user_profiles!inner(
        *,
        user_profile_images!inner(
          id,
          image_url,
          is_primary
        )
      )
    `)
    .eq("purchase_id", purchaseId)
    .order("expressed_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Express interest in a purchase
const expressInterest = async ({ purchaseId, treateeId }) => {
  console.log('Attempting to express interest:', { purchaseId, treateeId });
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error:', authError);
    throw authError;
  }
  console.log('Authenticated user:', user.id);

  // Verify the user's profile
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching user profile:', profileError);
    throw profileError;
  }
  console.log('User profile:', userProfile);

  // Verify the treatee_id matches the user's profile
  if (userProfile.id !== treateeId) {
    console.error('Treatee ID mismatch:', {
      userProfileId: userProfile.id,
      treateeId: treateeId
    });
    throw new Error('Treatee ID does not match user profile');
  }

  // Now attempt to insert the interest
  const { data, error } = await supabase
    .from("purchase_interests")
    .insert({
      purchase_id: purchaseId,
      treatee_id: treateeId,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error('Error expressing interest:', error);
    throw error;
  }

  return data;
};

export const useInterestedUsers = (purchaseId) => {
  return useQuery({
    queryKey: ["interestedUsers", purchaseId],
    queryFn: () => getInterestedUsers(purchaseId),
    enabled: !!purchaseId,
  });
};

export const useExpressInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expressInterest,
    onSuccess: (data, variables) => {
      // Invalidate the interested users query for this purchase
      queryClient.invalidateQueries(["interestedUsers", variables.purchaseId]);
      // Also invalidate the purchases query to update the interested count
      queryClient.invalidateQueries(["purchasedItems"]);
    },
  });
}; 