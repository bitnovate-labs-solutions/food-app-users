import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";
import { toast } from "sonner";

export const useConversations = (userId) => {
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useUserProfile({ id: userId });
  const queryClient = useQueryClient();

  // Add mutation for marking messages as read
  const markMessagesAsRead = useMutation({
    mutationFn: async (conversationId) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("is_read", false)
        .neq("sender_id", userId);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries(["conversations", userId]);
    },
  });

  // Add mutation for sending messages
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }) => {
      // Save message to database
      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          message_content: content,
          created_at: new Date().toISOString(),
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (updateError) throw updateError;

      return message;
    },
    onSuccess: () => {
      // Invalidate queries to trigger a refresh
      queryClient.invalidateQueries(["conversations", userId]);
    },
    onError: (error) => {
      console.error("Error in sendMessage:", error);
      toast.error("Failed to send message");
    },
  });

  // REALTIME SUBSCRIPTION ======================================================
  useEffect(() => {
    if (!currentUserProfile) return;

    // Create a channel
    const channel = supabase.channel("realtime-updates");

    // Subscribe to conversations table changes
    channel.on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "conversations",
        filter: `treater_id=eq.${currentUserProfile.id} or treatee_id=eq.${currentUserProfile.id}`,
      },
      () => {
        console.log("Conversation change received");
        queryClient.invalidateQueries(["conversations", userId]); // Trigger a refetch to get fresh data
      }
    );

    // Listen to all messages (and filter client-side if needed)
    channel.on(
      "postgres_changes",
      {
        event: "*", // Listen to all events
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const message = payload.new;
        if (
          message &&
          (message.treater_id === currentUserProfile.id ||
            message.treatee_id === currentUserProfile.id)
        ) {
          console.log("Message change received");
          queryClient.invalidateQueries(["conversations", userId]);
        }
      }
    );

    channel.subscribe();

    // OPTIONAL: Fallback refetch (polling) every 15 seconds
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries(["conversations", userId]);
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [currentUserProfile, userId, queryClient]);

  // USEQUERY ======================================================
  const result = useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!currentUserProfile) {
        return [];
      }

      try {
        // Get all conversations where the user is either treater or treatee
        const { data: conversations, error } = await supabase
          .from("conversations")
          .select(
            `
            *,
            treater:treater_id (
              id,
              user_id,
              display_name,
              user_profile_images!inner (
                image_url
              )
            ),
            treatee:treatee_id (
              id,
              user_id,
              display_name,
              user_profile_images!inner (
                image_url
              )
            ),
            messages (
              id,
              message_content,
              sender_id,
              created_at,
              is_read
            )
          `
          )
          .or(
            `treater_id.eq.${currentUserProfile.id},treatee_id.eq.${currentUserProfile.id}`
          )
          .order("updated_at", { ascending: false });

        if (error) throw error;

        // Transform the data to match the expected format
        const transformedConversations = conversations.map((conv) => {
          // Calculate unread count
          const unreadCount =
            conv.messages?.filter(
              (msg) => !msg.is_read && msg.sender_id !== userId
            ).length || 0;

          // Transform messages
          const messages =
            conv.messages?.map((msg) => ({
              id: msg.id,
              senderId: msg.sender_id,
              content: msg.message_content,
              timestamp: msg.created_at,
              read: msg.is_read,
            })) || [];

          // Sort messages by timestamp
          messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );

          return {
            id: conv.id,
            name:
              conv.treater.user_id === userId
                ? conv.treatee.display_name
                : conv.treater.display_name,
            avatar:
              conv.treater.user_id === userId
                ? conv.treatee.user_profile_images[0]?.image_url
                : conv.treater.user_profile_images[0]?.image_url,
            lastMessage: messages[messages.length - 1]?.content || "",
            unread: unreadCount,
            messages: messages,
            updated_at: conv.updated_at,
          };
        });

        return transformedConversations;
      } catch (error) {
        console.error("Error in useConversations:", error);
        throw error;
      }
    },
    enabled: !!userId && !!currentUserProfile && !isProfileLoading,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 3000, // Refetch every 3 seconds
  });

  return {
    ...result,
    markMessagesAsRead,
    sendMessage,
  };
};
