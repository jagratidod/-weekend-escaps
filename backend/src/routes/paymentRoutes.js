import express from 'express';
import {
  createPaymentOrder,
  getPaymentStatus,
  handleWebhook,
  initiateRefund,
  getAdminPayments,
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Customer PhonePe Gateway Endpoints
router.post('/phonepe/create-order', createPaymentOrder);
router.get('/phonepe/status/:merchantOrderId', getPaymentStatus);
router.post('/phonepe/webhook', handleWebhook);

// Admin Payment & Refund Management Endpoints
router.post('/phonepe/refund', protect, initiateRefund);
router.get('/admin/all', protect, getAdminPayments);

export default router;
