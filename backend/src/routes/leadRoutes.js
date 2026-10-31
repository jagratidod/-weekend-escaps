import express from 'express';
import {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
} from '../controllers/leadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createLead); // Public endpoint for contact form submissions
router.get('/', protect, getLeads); // Admin view
router.put('/:id/status', protect, updateLeadStatus);
router.delete('/:id', protect, deleteLead);

export default router;
