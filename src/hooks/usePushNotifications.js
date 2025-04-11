import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if the user has granted permission for notifications
    const checkNotificationPermission = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'granted') {
        setIsSubscribed(true);
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setIsSubscribed(permission === 'granted');
      }
    };

    checkNotificationPermission();
  }, []);

  return { isSubscribed };
}; 