import express from 'express';
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  resetToDefaultPackages,
  seedExistingFaqs,
  getPackageCategories,
  createPackageCategory,
  updatePackageCategory,
  deletePackageCategory,
  checkPackageAvailability,
  getUpcomingSlots,
} from '../controllers/packageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Category Routes (MUST BE BEFORE /:id) ──
router.get('/categories/all', getPackageCategories);
router.post('/categories', protect, createPackageCategory);
router.put('/categories/:id', protect, updatePackageCategory);
router.delete('/categories/:id', protect, deletePackageCategory);

// ── Admin Seeding Route ──
router.post('/seed', protect, resetToDefaultPackages);
router.post('/seed-faqs', protect, seedExistingFaqs);

// ── Package Public & Admin Routes ──
router.get('/', getPackages);
router.get('/:id/availability', checkPackageAvailability);
router.get('/:id/slots', getUpcomingSlots);
router.get('/:id', getPackageById);
router.post('/', protect, createPackage);
router.put('/:id', protect, updatePackage);
router.delete('/:id', protect, deletePackage);

export default router;
