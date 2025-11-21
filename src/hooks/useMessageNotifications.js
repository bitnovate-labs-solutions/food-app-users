import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePushNotifications } from './usePushNotifications';

export const useMessageNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = usePushNotifications();

  useEffect(() => {
    if (!user) return;

    // Get user's profile ID
    const getProfileId = async () => {
      const { data: profile } = await supabase
        .from('app_users')
        .select('id')
        .eq('profile_id', user.id)
        .single();
      return profile?.id;
    };

    // Subscribe to conversation updates
    const setupSubscription = async () => {
      const profileId = await getProfileId();
      if (!profileId) return;

      const channel = supabase
        .channel('conversation-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `(treater_id=eq.${profileId} OR treatee_id=eq.${profileId}) AND status=eq.active`,
          },
          async (payload) => {
            console.log('Conversation update:', payload);
            
            // Get the other user's profile
            const otherUserId = payload.new.treater_id === profileId 
              ? payload.new.treatee_id 
              : payload.new.treater_id;
            
            // Get app_users to find profile_id, then get display_name from profiles
            const { data: appUser } = await supabase
              .from('app_users')
              .select('profile_id')
              .eq('id', otherUserId)
              .single();

            if (appUser) {
              // Get display_name from profiles table
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', appUser.profile_id)
                .single();

              const displayName = profile?.display_name || 'Someone';
              
              // Show in-app notification (Messages page removed - Collection replaces it)
              toast.info(`New message from ${displayName}`, {
                duration: 5000,
                // Navigation to messages removed - Collection page replaces Messages
                // action: {
                //   label: 'View',
                //   onClick: () => {
                //     navigate(`/messages/${payload.new.id}`);
                //   },
                // },
              });

              // Send push notification if subscribed
              if (isSubscribed) {
                try {
                  const response = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                    },
                    body: JSON.stringify({
                      recipientId: appUser.profile_id,
                      title: 'New Message',
                      body: `New message from ${displayName}`,
                      data: {
                        url: '/collection', // Changed from /messages to /collection
                        conversationId: payload.new.id
                      }
                    }),
                  });

                  if (!response.ok) {
                    console.error('Failed to send push notification');
                  }
                } catch (error) {
                  console.error('Error sending push notification:', error);
                }
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [user, navigate, isSubscribed]);
}; 