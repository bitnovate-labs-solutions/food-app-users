import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  setupMessaging,
  getToken,
  onMessage,
} from "./lib/firebase/firebase-config";

const requestPermission = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const messaging = await setupMessaging();
    if (!messaging) return;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      ),
    });
    console.log("FCM Token:", token);

    // Save token to your Supabase DB for later use
  }
};

onMessage(setupMessaging, (payload) => {
  console.log("Message received in foreground:", payload);
  // You can display a toast or notification here
});

requestPermission();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
