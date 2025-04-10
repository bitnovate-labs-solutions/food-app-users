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
          console.log('Push notifications are not supported');
          return;
        }

        // Register service worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Check if we already have a subscription
        const existingSubscription = await reg.pushManager.getSubscription();
        if (existingSubscription) {
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
      }
    }

    setupPushNotifications();
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
        return true;
      } else {
        toast.error('Push notifications permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to enable push notifications');
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      if (!registration) {
        toast.error('Service worker not registered');
        return;
      }

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      // Subscribe to push notifications using Supabase's built-in functionality
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VITE_SUPABASE_PUBLIC_KEY
      });

      // Store subscription in Supabase
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: supabase.auth.user()?.id,
          push_subscription: subscription.toJSON(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Successfully subscribed to push notifications!');
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to subscribe to push notifications');
    }
  };

  const unsubscribeFromPushNotifications = async () => {
    try {
      if (!registration) return;

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove subscription from Supabase
      const { error } = await supabase
        .from('user_settings')
        .update({
          push_subscription: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', supabase.auth.user()?.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast.success('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to unsubscribe from push notifications');
    }
  };

  return {
    isSubscribed,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
  };
}; 