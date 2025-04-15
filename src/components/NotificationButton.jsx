// import { usePushNotifications } from "@/hooks/usePushNotifications";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BellOff, BellRing } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function NotificationRequest() {
  const { data: user, isLoading } = useUserProfile();
  const queryClient = useQueryClient();
  const [notificationPermission, setNotificationPermission] =
    useState("granted");

  // const {
  //   isSubscribed,
  //   subscribeToPushNotifications,
  //   unsubscribeFromPushNotifications,
  // } = usePushNotifications();

  // const handleToggle = async () => {
  //   if (isSubscribed) {
  //     await unsubscribeFromPushNotifications();
  //   } else {
  //     await subscribeToPushNotifications();
  //   }
  // };

  // const subscribeUser = async () => {
  //   if ("serviceWorker" in navigator) {
  //     try {
  //       // Check if service worker is already registered
  //       const registration = await navigator.serviceWorker.getRegistration();

  //       if (registration) {
  //         generateSubscribeEndPoint(registration);
  //       } else {
  //         // Register the service worker
  //         const newRegistration = await navigator.serviceWorker.register(
  //           "/sw.js"
  //         );

  //         // Subscribe to push notifications
  //         generateSubscribeEndPoint(newRegistration);
  //       }
  //     } catch (error) {
  //       toast.error(
  //         "Error during service worker registration or subscription",
  //         error
  //       );
  //     }
  //   }
  // };

  // // generate the key using web-push generate-vapid-keys, save the public key in .env.local
  // const generateSubscribeEndPoint = async (newRegistration) => {
  //   const applicationServerKey = urlB64ToUint8Array(
  //     import.meta.env.VITE_PUBLIC_VAPID_KEY
  //   );

  //   const options = {
  //     applicationServerKey,
  //     userVisibility: true, // this ensures the delivery of notifications that are visible to the user, eliminating silent notifications (mandatory in Chrome, optional in Firefox)
  //   };

  //   const subscription = await newRegistration.pushManager.subscribe(options);

  //   const { error } = await supabase
  //     .from("notification")
  //     .insert({ notification_json: JSON.stringify(subscription) });

  //   if (error) {
  //     toast.error(error.message);
  //   } else {
  //     queryClient.invalidateQueries({ queryKey: ["user"] });
  //   }
  // };

  // CHECK PERMISSION STATUS WHEN COMPONENT MOUNTS
  const showNotification = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          subscribeUser();
        } else {
          toast.info("Please go to setting and enable notification");
        }
      });
    } else {
      toast.info("This browser does not support notifications.");
    }
  };

  const removeNotification = async () => {
    setNotificationPermission("denied");

    const { error } = await supabase
      .from("notification")
      .delete()
      .eq("user_id", user?.id);

    if (error) {
      toast.error(error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="cursor-pointer transition-all">
      {notificationPermission === "granted" && user?.notification ? (
        <BellRing onClick={removeNotification} />
      ) : (
        <BellOff onClick={showNotification} />
      )}
    </div>
  );
}
