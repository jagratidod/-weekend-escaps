/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging Service Worker (SOP v3.0 - Duplicate-Safe)
 * Handles background push notifications, click navigation, and in-memory deduplication.
 */

// Import Firebase compat scripts inside service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Layer 3 Deduplication Set (SOP Section 5 & 7)
const shownNotifications = new Set();

// Clean set periodically to avoid memory leak
setInterval(() => {
  if (shownNotifications.size > 200) {
    shownNotifications.clear();
  }
}, 3600000); // clear every hour

// Initialize default Firebase app in service worker
firebase.initializeApp({
  apiKey: 'AIzaSyBogIaG6VvvLPb-3zU7geAbnr6fYkmoDps',
  projectId: 'growme-78cdc',
  messagingSenderId: '150457039733',
  appId: '1:150457039733:web:649cab126caa7cb04ef13c',
});

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (e) {
  console.warn('[SW FCM] Firebase messaging could not initialize in SW:', e);
}

if (messaging) {
  // Background push notification handler
  messaging.onBackgroundMessage((payload) => {
    const id = payload.data?.notificationId;

    // 🚫 Prevent duplicate display
    if (id && shownNotifications.has(id)) {
      return;
    }
    if (id) {
      shownNotifications.add(id);
    }

    const title = payload.notification?.title || payload.data?.title || 'Weekend Escapes';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || '',
      icon: payload.data?.icon || '/logo/logowhite.png',
      badge: '/icons/favicon-32x32.png',
      data: payload.data || {},
      tag: id || undefined, // Tag deduplication in OS notification shade
    };

    self.registration.showNotification(title, notificationOptions);
  });
}

// Click navigation handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetLink = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus if tab with target URL or domain is already open
      for (let client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(targetLink)) {
            return client.focus();
          }
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetLink);
      }
    })
  );
});
