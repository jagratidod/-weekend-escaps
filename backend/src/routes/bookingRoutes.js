import express from 'express';
import {
  createBooking,
  createOfflineRegistration,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public checkout submission
router.post('/', createBooking);

// Public offline registration submission (dedicated hidden flow)
router.post('/offline-register', createOfflineRegistration);

// Protected admin endpoints
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

export default router;
