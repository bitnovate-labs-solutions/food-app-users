import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    async function setupPushNotifications() {
      try {
        // Check if service worker and push manager are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.log('Push notifications are not supported in this browser');
          return;
        }

        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', reg);
        setRegistration(reg);

        // Check if we already have a subscription
        const existingSubscription = await reg.pushManager.getSubscription();
        console.log('Existing subscription:', existingSubscription);
        
        if (existingSubscription) {
          setIsSubscribed(true);
          
          // Verify subscription in user_settings
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('No user logged in');
            return;
          }

          const { data: settings, error: settingsError } = await supabase
            .from('user_settings')
            .select('push_subscription')
            .eq('user_id', user.id)
            .single();
            
          if (settingsError) {
            console.error('Error fetching user settings:', settingsError);
            return;
          }

          console.log('Current settings:', settings);
          
          // Verify the subscription is still valid
          if (!settings?.push_subscription) {
            console.log('No valid subscription found in settings');
            setIsSubscribed(false);
          }
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
        toast.error('Failed to set up push notifications');
      }
    }

    setupPushNotifications();
  }, []);

  const subscribeToPushNotifications = async () => {
    try {
      if (!registration) {
        console.error('Service worker not registered');
        toast.error('Service worker not registered');
        return;
      }

      // Request permission first
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      
      if (permission !== 'granted') {
        toast.error('Push notifications permission denied');
        return;
      }

      // Get the VAPID public key from Supabase
      const { data: vapidKey, error: keyError } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'vapid_public_key')
        .single();

      if (keyError || !vapidKey?.value) {
        console.error('Error getting VAPID key:', keyError);
        toast.error('Push notification configuration error');
        return;
      }

      console.log('Using VAPID public key:', vapidKey.value);

      // Convert the base64 public key to a Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidKey.value);
      console.log('Converted application server key:', applicationServerKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('New subscription:', subscription.toJSON());

      // Store subscription in Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        toast.error('You must be logged in to enable push notifications');
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          push_subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('Error storing subscription:', error);
        throw error;
      }

      console.log('Stored subscription data:', data);

      setIsSubscribed(true);
      toast.success('Successfully subscribed to push notifications!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      if (!registration) {
        console.error('Service worker not registered');
        return;
      }

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      console.log('Current subscription to unsubscribe:', subscription);

      if (subscription) {
        await subscription.unsubscribe();
        console.log('Successfully unsubscribed from push service');
      }

      // Remove subscription from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .update({
          push_subscription: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing subscription:', error);
        throw error;
      }

      setIsSubscribed(false);
      toast.success('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
    }
  };

  return {
    isSubscribed,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
  };
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 