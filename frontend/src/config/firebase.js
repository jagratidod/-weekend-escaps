import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBogIaG6VvvLPb-3zU7geAbnr6fYkmoDps',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'growme-78cdc.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'growme-78cdc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'growme-78cdc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '150457039733',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:150457039733:web:649cab126caa7cb04ef13c',
};

export const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BDr9Z338J76W_-AFxTQBTxA1nCE606fXXr3lwMMi-KgjO2l6qGUcC0Xd8nztxjWQZHBsEULzzx2aZs6tKqKDr30';

// Check if real web API key is provided
const isRealApiKey = Boolean(
  firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.toLowerCase().includes('dummy') &&
    !firebaseConfig.apiKey.toLowerCase().includes('here')
);

// Detect if real Firebase credentials are provided
export const isFirebaseConfigured = Boolean(
  isRealApiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes('dummy') &&
    vapidKey &&
    !vapidKey.toLowerCase().includes('dummy')
);

let app = null;
let messagingPromise = null;

if (typeof window !== 'undefined') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    messagingPromise = isSupported().then((supported) => {
      if (supported && isFirebaseConfigured) {
        return getMessaging(app);
      }
      if (!isRealApiKey) {
        console.info(
          'ℹ️ [FCM Web Push] Project & VAPID keys loaded for growme-78cdc.\n' +
            '   To enable browser push registration in Chrome/Firefox, make sure your Web API Key from Firebase Console (Project Settings > General > Web API Key) is set in VITE_FIREBASE_API_KEY in frontend/.env.'
        );
      }
      return null;
    });
  } catch (err) {
    console.warn('[FCM Client Initialization Warning]:', err.message);
  }
}

export { app, messagingPromise };
export default app;
