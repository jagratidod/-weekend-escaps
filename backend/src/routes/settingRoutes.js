import express from 'express';
import {
  getSettings,
  updateLogo,
  resetLogo,
  updateFooterLogo,
  resetFooterLogo,
  updateContactInfo,
  updateWhatsAppSettings,
} from '../controllers/settingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadLogo } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.post('/logo', protect, uploadLogo.single('logo'), updateLogo);
router.post('/logo/reset', protect, resetLogo);
router.post('/footer-logo', protect, uploadLogo.single('logo'), updateFooterLogo);
router.post('/footer-logo/reset', protect, resetFooterLogo);
router.put('/contact', protect, updateContactInfo);
router.put('/whatsapp', protect, updateWhatsAppSettings);

export default router;
