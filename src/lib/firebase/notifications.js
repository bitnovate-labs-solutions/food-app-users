// src/notifications.js
import { setupMessaging, getToken, onMessage } from "./firebase-config";

const PUBLIC_VAPID_KEY =
  "BCI1dGjo6xk5TZzJMN7j_alpdgJ8HfKvQykJVJPmvjRqggqSZ-wFJtBY3xHI3x85WAH867wEJ9NR_1kodLHoXsg";

export const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }

  const messaging = await setupMessaging();
  if (!messaging) return null;

  const token = await getToken(messaging, {
    vapidKey: PUBLIC_VAPID_KEY,
    serviceWorkerRegistration: await navigator.serviceWorker.ready,
  });

  console.log("🔔 FCM Token:", token);

  // Save this token to your DB (e.g., Supabase)
  return token;
};

export function listenToForegroundMessages(callback) {
  setupMessaging().then((messaging) => {
    if (messaging) {
      onMessage(messaging, callback);
    }
  });
}
