self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const { title, body, icon, url } = payload.notification || {};

  const options = {
    body,
    icon: icon || "/pwa-192x192.png",
    data: { url: url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(title || "New Message", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});

self.__WB_MANIFEST = self.__WB_MANIFEST || [];
