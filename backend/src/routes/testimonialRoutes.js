import express from 'express';
import {
  createTestimonial,
  getTestimonials,
  getAdminTestimonials,
  updateTestimonialStatus,
  deleteTestimonial,
  uploadPhoto,
} from '../controllers/testimonialController.js';
import { uploadTestimonialImage } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public photo upload & public submit / get approved
router.post('/upload', uploadTestimonialImage.single('image'), uploadPhoto);
router.route('/')
  .post(createTestimonial)
  .get(getTestimonials);

// Protected Admin moderation routes
router.get('/admin', protect, getAdminTestimonials);
router.put('/:id/status', protect, updateTestimonialStatus);
router.delete('/:id', protect, deleteTestimonial);

export default router;
