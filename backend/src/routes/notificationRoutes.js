import express from 'express';
import {
  saveFcmToken,
  removeFcmToken,
  testFcmNotification,
  sendBroadcastNotification,
  getNotificationStats,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// Optional auth middleware so admins saving tokens are recognized, while guest visitors are allowed
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'weekend_escapes_super_secret_jwt_key_2026'
      );
      req.admin = await Admin.findById(decoded.id).select('-password');
    } catch (_) {
      // Optional: ignore invalid/expired token for public callers
    }
  }
  next();
};

// Device Token Management Endpoints (SOP Section 6 Step 5)
router.post('/save', optionalAuth, saveFcmToken);
router.delete('/remove', optionalAuth, removeFcmToken);
router.post('/test', optionalAuth, testFcmNotification);

// Admin Broadcast & Stats Endpoints
router.post('/broadcast', protect, sendBroadcastNotification);
router.get('/stats', protect, getNotificationStats);

export default router;
