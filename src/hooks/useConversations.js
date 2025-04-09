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

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Get the conversation for this message
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
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
              )
            `)
            .eq('id', payload.new.conversation_id)
            .single();

          if (conversation && (conversation.treater_id === currentUserProfile.id || conversation.treatee_id === currentUserProfile.id)) {
            // Update the query cache with the new message
            queryClient.setQueryData(['conversations', userId], (oldData) => {
              if (!oldData) return oldData;

              const newMessage = {
                id: payload.new.id,
                senderId: payload.new.sender_id,
                content: payload.new.message_content,
                timestamp: payload.new.created_at,
                read: payload.new.is_read
              };

              const updatedConv = {
                id: conversation.id,
                name: conversation.treater.user_id === userId
                  ? conversation.treatee.display_name
                  : conversation.treater.display_name,
                avatar: conversation.treater.user_id === userId
                  ? conversation.treatee.user_profile_images[0]?.image_url
                  : conversation.treater.user_profile_images[0]?.image_url,
                lastMessage: payload.new.message_content,
                unread: payload.new.sender_id !== userId ? 1 : 0,
                updated_at: new Date().toISOString(),
                messages: [newMessage]
              };

              // Remove the old conversation if it exists
              const otherConvs = oldData.filter(c => c.id !== conversation.id);
              
              // Add the updated conversation at the top
              return [updatedConv, ...otherConvs];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('Message update received:', payload);
          
          // Handle message updates (like marking as read)
          queryClient.setQueryData(['conversations', userId], (oldData) => {
            if (!oldData) return oldData;

            return oldData.map((conv) => {
              if (conv.id === payload.new.conversation_id) {
                const updatedMessages = conv.messages.map(msg => 
                  msg.id === payload.new.id ? { ...msg, read: payload.new.is_read } : msg
                );
                
                return {
                  ...conv,
                  messages: updatedMessages,
                  unread: updatedMessages.filter(msg => !msg.read && msg.sender_id !== userId).length
                };
              }
              return conv;
            });
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUserProfile, userId, queryClient]);

  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      console.log("Fetching conversations for userId:", userId);
      console.log("Current user profile:", currentUserProfile);

      if (!currentUserProfile) {
        console.log("No current user profile, returning empty array");
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

        if (error) {
          console.error("Error fetching conversations:", error);
          throw error;
        }

        console.log("Raw conversations data:", conversations);

        if (!conversations || conversations.length === 0) {
          console.log("No conversations found");
          return [];
        }

        // Transform the data to match the expected format
        const transformedConversations = conversations.map((conv) => {
          console.log("Processing conversation:", conv);
          
          // Calculate unread count
          const unreadCount = conv.messages?.filter(
            msg => !msg.is_read && msg.sender_id !== userId
          ).length || 0;
          
          const transformed = {
            id: conv.id,
            name:
              conv.treater.user_id === userId
                ? conv.treatee.display_name
                : conv.treater.display_name,
            avatar:
              conv.treater.user_id === userId
                ? conv.treatee.user_profile_images[0]?.image_url
                : conv.treater.user_profile_images[0]?.image_url,
            lastMessage: conv.messages?.[conv.messages.length - 1]?.message_content || "No messages yet",
            unread: unreadCount,
            messages: conv.messages?.map((msg) => ({
              id: msg.id,
              senderId: msg.sender_id,
              content: msg.message_content,
              timestamp: msg.created_at,
              read: msg.is_read
            })) || [],
          };

          console.log("Transformed conversation:", transformed);
          return transformed;
        });

        console.log("Final transformed conversations:", transformedConversations);
        return transformedConversations;
      } catch (error) {
        console.error("Error in useConversations:", error);
        throw error;
      }
    },
    enabled: !!userId && !!currentUserProfile && !isProfileLoading,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    cacheTime: 1000 * 60 * 5, // Keep unused data in cache for 5 minutes
  });
};
