import express from 'express';
import {
  getSettings,
  updateLogo,
  resetLogo,
  updateFooterLogo,
  resetFooterLogo,
  updateDarkLogo,
  resetDarkLogo,
  updateContactInfo,
  updateWhatsAppSettings,
  updateHomeSections,
  resetHomeSection,
  updateFaqSection,
  resetFaqSection,
  updateThemeColor,
  resetThemeColor,
} from '../controllers/settingController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadLogo } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/theme', protect, updateThemeColor);
router.post('/theme/reset', protect, resetThemeColor);
router.post('/logo', protect, uploadLogo.single('logo'), updateLogo);
router.post('/logo/reset', protect, resetLogo);
router.post('/footer-logo', protect, uploadLogo.single('logo'), updateFooterLogo);
router.post('/footer-logo/reset', protect, resetFooterLogo);
router.post('/dark-logo', protect, uploadLogo.single('logo'), updateDarkLogo);
router.post('/dark-logo/reset', protect, resetDarkLogo);
router.put('/contact', protect, updateContactInfo);
router.put('/whatsapp', protect, updateWhatsAppSettings);
router.put('/home-sections', protect, updateHomeSections);
router.post('/home-sections/reset', protect, resetHomeSection);
router.put('/faq-section', protect, updateFaqSection);
router.post('/faq-section/reset', protect, resetFaqSection);

export default router;
