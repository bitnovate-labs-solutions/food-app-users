// 🔐 This is safe to expose — these are public Firebase config values (not secrets).

self.importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
self.importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

self.firebase.initializeApp({
  apiKey: "AIzaSyDSUfgdarPRMkoF5UWZVJdsJHwGXJDnSlw",
  authDomain: "tyd-app-0425.firebaseapp.com",
  projectId: "tyd-app-0425",
  messagingSenderId: "121653432900",
  appId: "1:121653432900:web:86326cd749a9ab30f3a211",
});

const messaging = self.firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/pwa-192x192.png",
  });
});
