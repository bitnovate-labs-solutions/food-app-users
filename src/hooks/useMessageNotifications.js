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
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
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
            
            const { data: otherUser } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('id', otherUserId)
              .single();

            if (otherUser) {
              // Show in-app notification
              toast.info(`New message from ${otherUser.display_name}`, {
                duration: 5000,
                action: {
                  label: 'View',
                  onClick: () => {
                    navigate(`/messages/${payload.new.id}`);
                  },
                },
              });

              // Send push notification if subscribed
              if (isSubscribed && 'serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                registration.showNotification('New Message', {
                  body: `New message from ${otherUser.display_name}`,
                  icon: '/pwa-192x192.png',
                  badge: '/pwa-192x192.png',
                  vibrate: [100, 50, 100],
                  data: {
                    url: '/messages',
                    conversationId: payload.new.id
                  }
                });
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