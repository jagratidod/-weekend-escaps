import express from 'express';
import {
  getGalleryPage,
  updateGalleryPage,
  resetGalleryPage,
} from '../controllers/galleryController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getGalleryPage);
router.put('/', protect, updateGalleryPage);
router.post('/reset', protect, resetGalleryPage);

export default router;
