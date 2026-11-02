import { firebaseMessaging, isFirebaseReady } from '../config/firebase.js';
import NotificationLog from '../models/NotificationLog.js';
import FcmDevice from '../models/FcmDevice.js';
import Admin from '../models/Admin.js';

/**
 * Utility to split an array into chunks of maximum size
 */
const chunkArray = (arr, chunkSize = 500) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Remove invalid/unregistered tokens from DB
 */
const pruneDeadTokens = async (deadTokens = []) => {
  if (!deadTokens.length) return;
  try {
    await FcmDevice.deleteMany({ token: { $in: deadTokens } });
    await Admin.updateMany(
      {},
      {
        $pull: {
          fcmTokens: { $in: deadTokens },
          fcmTokenMobile: { $in: deadTokens },
        },
      }
    );
    console.log(`[FCM] Pruned ${deadTokens.length} dead/expired token(s) from database.`);
  } catch (err) {
    console.error('[FCM] Error pruning dead tokens:', err.message);
  }
};

/**
 * Core Duplicate-Safe Multicast Sender
 *
 * Implements:
 * 1. Backend Idempotency Lock via unique notificationId
 * 2. Multi-device batching (max 500 tokens per chunk)
 * 3. Dead token pruning
 * 4. Simulated fallback when running in development/dummy credentials
 */
export const sendPushNotification = async ({
  notificationId,
  recipient = 'user',
  userId = null,
  tokens = [],
  title,
  body,
  data = {},
}) => {
  try {
    if (!notificationId) {
      throw new Error('notificationId is required for duplicate-safe delivery');
    }

    // Layer 1: Check if already sent (Idempotency Lock)
    const existingLog = await NotificationLog.findOne({ notificationId });
    if (existingLog) {
      console.log(`[FCM Duplicate-Safe] Skipped already sent notification: ${notificationId}`);
      return { success: true, skipped: true, reason: 'duplicate', log: existingLog };
    }

    // Clean tokens & remove duplicates
    const uniqueTokens = [...new Set((tokens || []).filter(Boolean))];

    // Standardize data payload (Firebase data values must be strings)
    const stringifiedData = {
      notificationId,
      ...Object.keys(data || {}).reduce((acc, key) => {
        acc[key] = String(data[key] ?? '');
        return acc;
      }, {}),
    };

    // If no tokens to send to, record log and exit
    if (uniqueTokens.length === 0) {
      console.log(`[FCM] No registered device tokens found for notification: ${notificationId}`);
      const log = await NotificationLog.create({
        notificationId,
        recipient,
        userId,
        tokens: [],
        title,
        body,
        data: stringifiedData,
        status: 'sent',
        sentCount: 0,
        failedCount: 0,
      });
      return { success: true, sentCount: 0, failedCount: 0, log };
    }

    // If Firebase Admin SDK is not ready (running on dummy credentials), record simulated delivery
    if (!isFirebaseReady || !firebaseMessaging) {
      console.log(
        `[FCM SIMULATED] Notification "${title}" to ${uniqueTokens.length} device(s) [ID: ${notificationId}]`
      );
      const log = await NotificationLog.create({
        notificationId,
        recipient,
        userId,
        tokens: uniqueTokens,
        title,
        body,
        data: stringifiedData,
        status: 'simulated',
        sentCount: uniqueTokens.length,
        failedCount: 0,
      });
      return { success: true, simulated: true, sentCount: uniqueTokens.length, log };
    }

    // Split into chunks of 500 for Firebase Multicast
    const chunks = chunkArray(uniqueTokens, 500);
    let totalSuccess = 0;
    let totalFailed = 0;
    const deadTokens = [];

    for (const chunk of chunks) {
      const message = {
        tokens: chunk,
        notification: {
          title: title || 'Weekend Escapes',
          body: body || '',
        },
        data: stringifiedData,
      };

      const response = await firebaseMessaging.sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailed += response.failureCount;

      response.responses.forEach((resp, index) => {
        if (!resp.success && resp.error) {
          const errorCode = resp.error.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/mismatched-credential'
          ) {
            deadTokens.push(chunk[index]);
          }
        }
      });
    }

    // Prune invalid tokens in the background
    if (deadTokens.length > 0) {
      pruneDeadTokens(deadTokens);
    }

    // Save Idempotency Lock in Database
    const log = await NotificationLog.create({
      notificationId,
      recipient,
      userId,
      tokens: uniqueTokens,
      title,
      body,
      data: stringifiedData,
      status: 'sent',
      sentCount: totalSuccess,
      failedCount: totalFailed,
    });

    console.log(
      `[FCM Sent] ID: ${notificationId} | Success: ${totalSuccess} | Failed: ${totalFailed}`
    );

    return { success: true, sentCount: totalSuccess, failedCount: totalFailed, log };
  } catch (error) {
    console.error(`[FCM Send Error for ${notificationId}]:`, error.message);

    // If duplicate key error (MongoDB code 11000), gracefully treat as duplicate prevention
    if (error.code === 11000) {
      console.log(`[FCM Duplicate-Safe] Concurrent duplicate blocked: ${notificationId}`);
      return { success: true, skipped: true, reason: 'duplicate_concurrent' };
    }

    try {
      await NotificationLog.create({
        notificationId,
        recipient,
        userId,
        tokens,
        title,
        body,
        data,
        status: 'failed',
        error: error.message,
      });
    } catch (_) {
      // Ignore secondary error
    }

    return { success: false, error: error.message };
  }
};

/**
 * Send push notification to all Admin devices
 */
export const notifyAdmins = async ({ title, body, data = {}, notificationId }) => {
  try {
    // 1. Gather all tokens marked as admin from FcmDevice
    const adminDevices = await FcmDevice.find({ isAdmin: true }).select('token');
    let tokens = adminDevices.map((d) => d.token);

    // 2. Also gather tokens stored directly on Admin models
    const admins = await Admin.find().select('fcmTokens fcmTokenMobile');
    admins.forEach((admin) => {
      if (Array.isArray(admin.fcmTokens)) tokens.push(...admin.fcmTokens);
      if (Array.isArray(admin.fcmTokenMobile)) tokens.push(...admin.fcmTokenMobile);
    });

    tokens = [...new Set(tokens.filter(Boolean))];

    const uniqueNotifId = notificationId || `admin_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return await sendPushNotification({
      notificationId: uniqueNotifId,
      recipient: 'admin',
      tokens,
      title,
      body,
      data: {
        ...data,
        target: 'admin',
      },
    });
  } catch (err) {
    console.error('[notifyAdmins Error]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send push notification to a specific customer / user / visitor
 */
export const notifyCustomer = async ({
  email = null,
  visitorId = null,
  userId = null,
  title,
  body,
  data = {},
  notificationId,
}) => {
  try {
    const queryConditions = [];
    if (email) queryConditions.push({ email: email.toLowerCase() });
    if (visitorId) queryConditions.push({ visitorId });
    if (userId) queryConditions.push({ userId });

    let tokens = [];

    if (queryConditions.length > 0) {
      const devices = await FcmDevice.find({ $or: queryConditions }).select('token');
      tokens = devices.map((d) => d.token);
    }

    tokens = [...new Set(tokens.filter(Boolean))];

    const uniqueNotifId =
      notificationId || `customer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    return await sendPushNotification({
      notificationId: uniqueNotifId,
      recipient: 'customer',
      userId: userId || email || visitorId,
      tokens,
      title,
      body,
      data: {
        ...data,
        target: 'customer',
      },
    });
  } catch (err) {
    console.error('[notifyCustomer Error]:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send broadcast notification to all subscribed users & visitors
 */
export const broadcastToAll = async ({ title, body, data = {}, notificationId }) => {
  try {
    // Fetch all active tokens
    const devices = await FcmDevice.find().select('token');
    const tokens = [...new Set(devices.map((d) => d.token).filter(Boolean))];

    const uniqueNotifId =
      notificationId || `broadcast_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    return await sendPushNotification({
      notificationId: uniqueNotifId,
      recipient: 'broadcast',
      tokens,
      title,
      body,
      data: {
        ...data,
        type: 'broadcast',
        broadcastAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[broadcastToAll Error]:', err.message);
    return { success: false, error: err.message };
  }
};
