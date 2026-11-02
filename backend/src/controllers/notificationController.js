import FcmDevice from '../models/FcmDevice.js';
import NotificationLog from '../models/NotificationLog.js';
import Admin from '../models/Admin.js';
import {
  broadcastToAll,
  sendPushNotification,
} from '../services/firebaseNotificationService.js';
import { isFirebaseReady } from '../config/firebase.js';

/**
 * POST /api/fcm-tokens/save
 * Save or refresh a device token (Web, Android, iOS)
 */
export const saveFcmToken = async (req, res) => {
  try {
    const { token, platform = 'web', visitorId = null, email = null, isAdmin = false } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'A valid FCM registration token is required',
      });
    }

    // Determine admin status either from token payload or auth header
    const loggedInAdmin = req.admin || null;
    const isDeviceAdmin = Boolean(isAdmin || loggedInAdmin);
    const userId = loggedInAdmin ? loggedInAdmin._id.toString() : null;
    const userEmail = email || (loggedInAdmin ? loggedInAdmin.email : null);

    // Upsert into FcmDevice
    const device = await FcmDevice.registerToken({
      token: token.trim(),
      visitorId: visitorId ? String(visitorId).trim() : null,
      userId,
      email: userEmail,
      isAdmin: isDeviceAdmin,
      platform: ['web', 'android', 'ios'].includes(platform) ? platform : 'web',
      userAgent: req.headers['user-agent'] || '',
    });

    // If logged in as Admin, also maintain in Admin model (max 10 tokens per SOP)
    if (loggedInAdmin) {
      const adminDoc = await Admin.findById(loggedInAdmin._id);
      if (adminDoc) {
        let existingTokens = adminDoc.fcmTokens || [];
        if (!existingTokens.includes(token)) {
          existingTokens.push(token);
          // Limit to max 10 tokens per user
          if (existingTokens.length > 10) {
            existingTokens = existingTokens.slice(-10);
          }
          adminDoc.fcmTokens = existingTokens;
          await adminDoc.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'FCM device token registered successfully',
      device: {
        id: device._id,
        platform: device.platform,
        isAdmin: device.isAdmin,
        lastActive: device.lastActive,
      },
    });
  } catch (error) {
    console.error('[saveFcmToken Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save FCM token',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/fcm-tokens/remove
 * Remove/unsubscribe a device token
 */
export const removeFcmToken = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required to unregister device',
      });
    }

    await FcmDevice.deleteOne({ token });

    if (req.admin) {
      await Admin.findByIdAndUpdate(req.admin._id, {
        $pull: { fcmTokens: token, fcmTokenMobile: token },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token removed successfully',
    });
  } catch (error) {
    console.error('[removeFcmToken Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove FCM token',
      error: error.message,
    });
  }
};

/**
 * POST /api/fcm-tokens/test
 * Send a test notification to a specific token or admin device
 */
export const testFcmNotification = async (req, res) => {
  try {
    const { token, title, body, link } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required to send test notification',
      });
    }

    const testNotificationId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const result = await sendPushNotification({
      notificationId: testNotificationId,
      recipient: 'test_device',
      tokens: [token],
      title: title || '⚡ Weekend Escapes Test Push',
      body: body || 'Test push notification delivered successfully! FCM is configured and working.',
      data: {
        type: 'test',
        link: link || '/admin',
        sentAt: new Date().toISOString(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Test notification triggered',
      isFirebaseLive: isFirebaseReady,
      result,
    });
  } catch (error) {
    console.error('[testFcmNotification Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message,
    });
  }
};

/**
 * POST /api/notifications/broadcast
 * Broadcast notification to all subscribed users (Admin Protected)
 */
export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body, link, image, category = 'announcement' } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required for broadcast notification',
      });
    }

    const broadcastId = `broadcast_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const result = await broadcastToAll({
      title: title.trim(),
      body: body.trim(),
      data: {
        type: 'broadcast',
        link: link || '/',
        image: image || '',
        category,
      },
      notificationId: broadcastId,
    });

    res.status(200).json({
      success: true,
      message: 'Broadcast notification dispatched successfully',
      isFirebaseLive: isFirebaseReady,
      broadcastId,
      result,
    });
  } catch (error) {
    console.error('[sendBroadcastNotification Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast notification',
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications/stats
 * Get audience size, device breakdown, and recent notification logs (Admin Protected)
 */
export const getNotificationStats = async (req, res) => {
  try {
    const [totalDevices, adminDevices, webDevices, mobileDevices, recentLogs] =
      await Promise.all([
        FcmDevice.countDocuments(),
        FcmDevice.countDocuments({ isAdmin: true }),
        FcmDevice.countDocuments({ platform: 'web' }),
        FcmDevice.countDocuments({ platform: { $in: ['android', 'ios'] } }),
        NotificationLog.find().sort({ createdAt: -1 }).limit(20).lean(),
      ]);

    res.status(200).json({
      success: true,
      isFirebaseLive: isFirebaseReady,
      stats: {
        totalDevices,
        adminDevices,
        webDevices,
        mobileDevices,
      },
      recentLogs,
    });
  } catch (error) {
    console.error('[getNotificationStats Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message,
    });
  }
};
