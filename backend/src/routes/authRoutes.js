import express from 'express';
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  getAdminMe,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/admin/forgot-password', adminForgotPassword);
router.post('/admin/reset-password/:token', adminResetPassword);
router.get('/admin/me', protect, getAdminMe);

export default router;
