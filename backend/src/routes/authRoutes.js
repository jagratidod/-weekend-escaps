import express from 'express';
import {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  getAdminMe,
  changeAdminPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/admin/forgot-password', adminForgotPassword);
router.post('/admin/reset-password/:token', adminResetPassword);
router.get('/admin/me', protect, getAdminMe);
router.put('/admin/change-password', protect, changeAdminPassword);

export default router;
