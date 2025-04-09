import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useChatRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treaterId, treateeId, purchaseId }) => {
      try {
        console.log("Starting chat request with:", {
          treaterId,
          treateeId,
          purchaseId,
        });

        // First, get the current user's profile (treater)
        const { data: currentUserProfile, error: profileError } = await supabase
          .from("user_profiles")
          .select("id, role")
          .eq("user_id", treaterId) // This is the auth.users.id
          .single();

        console.log("Current user profile:", currentUserProfile);
        console.log("Profile error:", profileError);

        if (profileError) {
          console.error("Profile error:", profileError);
          throw new Error("User profile not found");
        }

        if (!currentUserProfile) {
          throw new Error("User profile not found");
        }

        if (currentUserProfile.role !== "treater") {
          throw new Error("Only treaters can start conversations");
        }

        // Get the treatee's profile
        const { data: treateeProfile, error: treateeError } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("user_id", treateeId) // This is the auth.users.id
          .single();

        if (treateeError) {
          console.error("Treatee profile error:", treateeError);
          throw new Error("Could not find treatee profile");
        }

        if (!treateeProfile) {
          throw new Error("Treatee profile not found");
        }

        // Check if a conversation already exists
        const { data: existingConversation, error: checkError } = await supabase
          .from("conversations")
          .select("*")
          .eq("treater_id", currentUserProfile.id) // This is user_profiles.id
          .eq("treatee_id", treateeProfile.id) // This is user_profiles.id
          .eq("purchase_id", purchaseId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("Check conversation error:", checkError);
          throw checkError;
        }

        if (existingConversation) {
          return existingConversation;
        }

        // Create a new conversation
        const { data: conversation, error: createError } = await supabase
          .from("conversations")
          .insert({
            treater_id: currentUserProfile.id, // This is user_profiles.id
            treatee_id: treateeProfile.id, // This is user_profiles.id
            purchase_id: purchaseId,
            status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error("Create conversation error:", createError);
          throw createError;
        }

        // Create a notification for the treatee
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: treateeProfile.id, // This is user_profiles.id
            type: "chat_request",
            message: "You have a new chat request",
            data: {
              conversation_id: conversation.id,
              treater_id: currentUserProfile.id, // This is user_profiles.id
              purchase_id: purchaseId,
            },
            created_at: new Date().toISOString(),
          });

        if (notificationError) {
          console.error("Notification error:", notificationError);
          throw notificationError;
        }

        return conversation;
      } catch (error) {
        console.error("Chat request error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Chat request sent successfully!", data);
    },
    onError: (error) => {
      toast.error("Failed to send chat request", {
        description: error.message,
      });
    },
  });
};
