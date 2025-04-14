import { createSupabaseServer } from "@/lib/supabase/server";
import webpush from "web-push";

export const sendNofication = async ({ message, user_id, icon, name }) => {
  const vapidKeys = {
    publicKey: import.meta.VITE_PUBLIC_VAPID_KEY,
    privateKey: import.meta.VITE_PRIVATE_VAPID_KEY,
  };

  // SETTING OUR PREVIOUSLY GENERATED VAPID KEYS
  webpush.setVapidDetails(
    "mailto:myuserid@email.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  const supabase = createSupabaseServer();

  // FETCH USER'S ENDPOINT
  const { data, error } = await supabase
    .from("notification")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    return JSON.stringify({ error: error.message });
  } else if (data) {
    try {
      await webpush.sendNotification(
        JSON.parse(data.notification_json),
        JSON.stringify({
          message: name,
          icon,
          body: message,
        })
      );
      return "{}";
    } catch (error) {
      return JSON.stringify({ error: "Failed to send notification" });
    }
  }
};
