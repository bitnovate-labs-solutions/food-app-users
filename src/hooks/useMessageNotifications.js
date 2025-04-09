import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useMessageNotifications = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Get the conversation for this message
          const { data: conversation } = await supabase
            .from('conversations')
            .select(`
              *,
              treater:treater_id (
                display_name
              ),
              treatee:treatee_id (
                display_name
              )
            `)
            .eq('id', payload.new.conversation_id)
            .single();

          if (conversation && payload.new.sender_id !== userId) {
            const otherUser = conversation.treater_id === userId 
              ? conversation.treatee 
              : conversation.treater;

            toast.info(`New message from ${otherUser.display_name}`, {
              description: payload.new.message_content,
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  // You can add navigation logic here if needed
                  window.location.href = '/messages';
                },
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
}; 