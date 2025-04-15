// Purpose of this hook: handle the creation and management of chat conversations between 2 users (treater/treatee)
//  Creates a new chat conversation between "treater" and "treatee"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Helper function to fetch a single user profile
const fetchUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("user_id", userId) // takes a userId as input
    .single();

  if (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw error;
  }

  return data; // returns the profile data or throws an error
};

// Helper function to create a message
const createMessage = async (conversationId, senderId, messageContent) => {
  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message_content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
    })
    .select()
    .single();

  if (messageError) {
    console.error("Error creating message:", messageError);
    throw messageError;
  }

  return message;
};

export const useChatRequest = () => {
  const queryClient = useQueryClient(); // Initializes the query client for cache management

  return useMutation({
    mutationFn: async ({ treaterId, treateeId, purchaseId, initialMessage }) => {
      // Fetch both user profiles in parallel
      const [treaterProfile, treateeProfile] = await Promise.all([
        fetchUserProfile(treaterId),
        fetchUserProfile(treateeId),
      ]);

      let conversation;
      let createdMessage = null;

      // Check for existing conversation
      const { data: existingConversation, error: checkError } = await supabase // Queries the conversations table for an existing chat
        .from("conversations")
        .select("*")
        .eq("treater_id", treaterProfile.id) // Checks for a conversation between the two users
        .eq("treatee_id", treateeProfile.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error checking for existing conversation:", checkError);
        throw checkError;
      }

      // If conversation exists, use it, otherwise create new one
      if (existingConversation) {
        console.log("Existing conversation found:", existingConversation);
        conversation = existingConversation;
      } else {
        // Create new conversation using profile IDs
        const { data: newConversation, error: conversationError } = await supabase
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

        conversation = newConversation;
      }

      // Create initial message for both new and existing conversations
      if (initialMessage && conversation) {
        createdMessage = await createMessage(conversation.id, treaterId, initialMessage);
      }

      return { conversation, message: createdMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] }); // Invalidates the conversations query cache
      toast.success("Message sent successfully!"); // Shows success notification to user
    },
    onError: (error) => {
      console.error("Chat request failed:", error);
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
  });
};
