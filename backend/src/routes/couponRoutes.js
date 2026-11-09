import express from 'express';
import {
  validateCoupon,
  getAvailableCoupons,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  seedCoupons,
} from '../controllers/couponController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public checkout validation & discovery routes
router.post('/validate', validateCoupon);
router.get('/available', getAvailableCoupons);

// Admin-protected routes
router.get('/', protect, getAllCoupons);
router.post('/', protect, createCoupon);
router.post('/seed', protect, seedCoupons);
router.put('/:id', protect, updateCoupon);
router.patch('/:id/toggle', protect, toggleCouponStatus);
router.delete('/:id', protect, deleteCoupon);

export default router;
