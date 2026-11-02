import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messagingPromise, vapidKey, isFirebaseConfigured } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// In-memory set for Layer 3 Frontend Deduplication (SOP Section 5 & 7)
const shownForegroundNotifications = new Set();

// Helper to get or generate persistent visitor UUID
export const getVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('we_visitor_id');
  if (!id) {
    id = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('we_visitor_id', id);
  }
  return id;
};

export function usePushNotifications() {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('we_fcm_token');
      // Purge any stale simulated token from earlier testing
      if (stored && stored.startsWith('simulated_')) {
        localStorage.removeItem('we_fcm_token');
        return null;
      }
      return stored || null;
    }
    return null;
  });

  const [isSubscribed, setIsSubscribed] = useState(Boolean(token && permission === 'granted'));
  const [loading, setLoading] = useState(false);
  const [foregroundNotification, setForegroundNotification] = useState(null);
  const unsubscribeListenerRef = useRef(null);

  // Send token to backend /api/fcm-tokens/save
  const saveTokenToBackend = useCallback(async (fcmToken, { isAdmin = false, email = null } = {}) => {
    try {
      const visitorId = getVisitorId();
      const adminToken = localStorage.getItem('admin_token');

      const headers = {
        'Content-Type': 'application/json',
      };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
      }

      const res = await fetch(`${API_BASE_URL}/fcm-tokens/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          token: fcmToken,
          visitorId,
          email,
          platform: 'web',
          isAdmin: Boolean(isAdmin || adminToken),
        }),
      });

      const data = await res.json();
      console.log('✅ [FCM Device Registration Saved]:', data);
      return data;
    } catch (err) {
      console.error('[usePushNotifications] Failed to save token to server:', err);
      return null;
    }
  }, []);

  // Request browser permission and fetch FCM token
  const requestNotificationPermission = useCallback(
    async ({ isAdmin = false, email = null } = {}) => {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('[FCM] Notifications are not supported in this browser.');
        return { success: false, message: 'Notifications not supported' };
      }

      setLoading(true);
      try {
        const result = await Notification.requestPermission();
        setPermission(result);

        if (result !== 'granted') {
          setLoading(false);
          return { success: false, message: 'Permission denied by user' };
        }

        // Live Firebase FCM token retrieval
        const messaging = await messagingPromise;
        if (!messaging) {
          setLoading(false);
          return { success: false, message: 'Firebase messaging not ready' };
        }

        // Register Service Worker explicitly and await ready
        let registration = null;
        if ('serviceWorker' in navigator) {
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;

          // Clear any stale browser push subscription created with older sender IDs
          try {
            const staleSub = await registration.pushManager.getSubscription();
            if (staleSub) {
              const oldToken = localStorage.getItem('we_fcm_token');
              // If we don't have a fresh token verified or explicitly requesting, renew
              if (!oldToken || oldToken.includes('simulated')) {
                await staleSub.unsubscribe();
                console.log('🔄 [FCM] Cleared stale browser push subscription.');
              }
            }
          } catch (_) {
            // Ignore unsubscribe error
          }
        }

        console.log('🔄 [FCM] Requesting live device token with VAPID key...');
        const currentToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration,
        });

        if (currentToken) {
          console.log('🎯 [FCM] Got real Google FCM token:', currentToken.substring(0, 25) + '...');
          localStorage.setItem('we_fcm_token', currentToken);
          setToken(currentToken);
          setIsSubscribed(true);

          await saveTokenToBackend(currentToken, { isAdmin, email });

          setLoading(false);
          return { success: true, token: currentToken };
        } else {
          setLoading(false);
          return { success: false, message: 'No registration token available' };
        }
      } catch (err) {
        console.error('[usePushNotifications] Error requesting token:', err);
        setLoading(false);
        return { success: false, error: err.message };
      }
    },
    [saveTokenToBackend]
  );

  // Auto-sync token on mount if permission already granted
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const adminToken = localStorage.getItem('admin_token');
      // Silently refresh token and ensure DB has this device registered
      requestNotificationPermission({ isAdmin: Boolean(adminToken) });
    }
  }, [requestNotificationPermission]);

  // Unregister / unsubscribe token
  const unsubscribe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('admin_token');
      const headers = { 'Content-Type': 'application/json' };
      if (adminToken) headers.Authorization = `Bearer ${adminToken}`;

      await fetch(`${API_BASE_URL}/fcm-tokens/remove`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ token }),
      });

      localStorage.removeItem('we_fcm_token');
      setToken(null);
      setIsSubscribed(false);
    } catch (err) {
      console.error('[usePushNotifications] Error removing token:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Foreground notification handler (SOP Section 7 Step 5)
  useEffect(() => {
    let active = true;

    const setupForegroundListener = async () => {
      const messaging = await messagingPromise;
      if (!messaging) return;

      try {
        const unsubscribe = onMessage(messaging, (payload) => {
          if (!active) return;
          const id = payload.data?.notificationId;

          // Layer 3 Deduplication (Set-based filtering)
          if (id && shownForegroundNotifications.has(id)) {
            return;
          }
          if (id) {
            shownForegroundNotifications.add(id);
          }

          const notif = {
            id: id || `fg_${Date.now()}`,
            title: payload.notification?.title || payload.data?.title || 'Weekend Escapes',
            body: payload.notification?.body || payload.data?.body || '',
            link: payload.data?.link || '/',
            data: payload.data || {},
            timestamp: new Date(),
          };

          // 1. Show In-App UI Toast Banner
          setForegroundNotification(notif);

          // 2. Also trigger Real Native Browser Notification Popup (SOP Step 5)
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notif.title, {
                body: notif.body,
                icon: '/logo/logowhite.png',
                badge: '/icons/favicon-32x32.png',
                data: notif.data,
                tag: id || undefined,
              });
            }
          } catch (nativeErr) {
            console.warn('[FCM] Native notification trigger fallback:', nativeErr.message);
          }
        });

        unsubscribeListenerRef.current = unsubscribe;
      } catch (err) {
        console.warn('[usePushNotifications] Foreground listener error:', err.message);
      }
    };

    setupForegroundListener();

    return () => {
      active = false;
      if (typeof unsubscribeListenerRef.current === 'function') {
        unsubscribeListenerRef.current();
      }
    };
  }, []);

  const dismissForegroundNotification = useCallback(() => {
    setForegroundNotification(null);
  }, []);

  return {
    permission,
    token,
    isSubscribed,
    loading,
    foregroundNotification,
    dismissForegroundNotification,
    requestNotificationPermission,
    unsubscribe,
    visitorId: getVisitorId(),
  };
}
