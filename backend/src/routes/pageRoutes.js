import express from 'express';
import {
  getPageBySlug,
  updatePage,
  resetPage,
} from '../controllers/pageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to view page content
router.get('/:slug', getPageBySlug);

// Protected admin routes to update or reset page content
router.put('/:slug', protect, updatePage);
router.post('/:slug/reset', protect, resetPage);

export default router;
