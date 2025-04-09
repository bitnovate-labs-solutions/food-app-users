import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useChatRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ treaterId, treateeId, purchaseId }) => {
      console.log("Starting chat request with:", { treaterId, treateeId, purchaseId });

      // First, get the profile IDs for both users
      const { data: treaterProfile, error: treaterError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", treaterId)
        .single();

      if (treaterError) {
        console.error("Error fetching treater profile:", treaterError);
        throw treaterError;
      }

      const { data: treateeProfile, error: treateeError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", treateeId)
        .single();

      if (treateeError) {
        console.error("Error fetching treatee profile:", treateeError);
        throw treateeError;
      }

      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from("conversations")
        .select("*")
        .eq("treater_id", treaterProfile.id)
        .eq("treatee_id", treateeProfile.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned"
        console.error("Error checking for existing conversation:", checkError);
        throw checkError;
      }

      // If conversation exists, return it
      if (existingConversation) {
        console.log("Existing conversation found:", existingConversation);
        return existingConversation;
      }

      // Create new conversation using profile IDs
      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          treater_id: treaterProfile.id,
          treatee_id: treateeProfile.id,
          purchase_id: purchaseId,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (conversationError) {
        console.error("Conversation error:", conversationError);
        throw conversationError;
      }

      return conversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      console.error("Chat request failed:", error);
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });
};
