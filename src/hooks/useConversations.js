import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffect } from "react";

export const useConversations = (userId) => {
  const { data: currentUserProfile, isLoading: isProfileLoading } = useUserProfile({ id: userId });
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserProfile) return;

    // Create a channel for both messages and conversations
    const channel = supabase
      .channel('realtime-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(select id from conversations where treater_id=${currentUserProfile.id} or treatee_id=${currentUserProfile.id})`
        },
        async (payload) => {
          console.log('Message change received:', payload);
          // Trigger a refetch to get fresh data
          queryClient.invalidateQueries(['conversations', userId]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'conversations',
          filter: `treater_id=eq.${currentUserProfile.id} or treatee_id=eq.${currentUserProfile.id}`
        },
        async (payload) => {
          console.log('Conversation change received:', payload);
          // Trigger a refetch to get fresh data
          queryClient.invalidateQueries(['conversations', userId]);
        }
      )
      .subscribe();

    // Set up periodic refetch every 5 seconds as a backup
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries(['conversations', userId]);
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [currentUserProfile, userId, queryClient]);

  return useQuery({
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
          const unreadCount = conv.messages?.filter(
            msg => !msg.is_read && msg.sender_id !== userId
          ).length || 0;
          
          // Transform messages
          const messages = conv.messages?.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            content: msg.message_content,
            timestamp: msg.created_at,
            read: msg.is_read
          })) || [];

          // Sort messages by timestamp
          messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
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
            updated_at: conv.updated_at
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
};
