import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let isFirebaseReady = false;
let firebaseMessaging = null;
let firebaseApp = null;

try {
  let credential = null;

  // 1. Check if a local service account JSON file exists
  const localServiceAccountPath = path.resolve(__dirname, './firebase-service-account.json');
  const envServiceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(__dirname, '../../', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

  if (fs.existsSync(localServiceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localServiceAccountPath, 'utf8'));
    credential = cert(serviceAccount);
  } else if (envServiceAccountPath && fs.existsSync(envServiceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(envServiceAccountPath, 'utf8'));
    credential = cert(serviceAccount);
  }
  // 2. Otherwise, check environment variables (Project ID, Client Email, Private Key)
  else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    !process.env.FIREBASE_PROJECT_ID.includes('dummy') &&
    process.env.FIREBASE_PRIVATE_KEY.includes('PRIVATE KEY')
  ) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    credential = cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    });
  }

  if (credential) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp({ credential });
    firebaseMessaging = getMessaging(firebaseApp);
    isFirebaseReady = true;
    console.log('✅ [FCM] Firebase Cloud Messaging Admin SDK initialized LIVE for project: growme-78cdc');
  } else {
    console.warn(
      '⚠️ [FCM] Running in SIMULATED MODE: Dummy or missing Firebase credentials in .env.\n' +
        '       Push notifications will be recorded in NotificationLog and simulated.\n' +
        '       Once you replace dummy values in .env with your real Firebase Service Account, live push will activate automatically.'
    );
  }
} catch (error) {
  console.error('⚠️ [FCM Initialization Warning]:', error.message);
  console.warn('   Backend will continue running in simulated push notification mode.');
}

export { firebaseApp, isFirebaseReady, firebaseMessaging };
export default firebaseApp;
