import express from 'express';
import {
  getSettings,
  updateLogo,
  resetLogo,
  updateContactInfo,
} from '../controllers/settingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadLogo } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.post('/logo', protect, uploadLogo.single('logo'), updateLogo);
router.post('/logo/reset', protect, resetLogo);
router.put('/contact', protect, updateContactInfo);

export default router;
