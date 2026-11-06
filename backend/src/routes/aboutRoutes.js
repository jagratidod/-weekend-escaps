import express from 'express';
import {
  getAboutPage,
  updateAboutPage,
  resetAboutPage,
} from '../controllers/aboutController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAboutPage);
router.put('/', protect, updateAboutPage);
router.post('/reset', protect, resetAboutPage);

export default router;
