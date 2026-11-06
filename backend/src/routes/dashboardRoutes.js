import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/stats (Protected, Admin only)
router.get('/stats', protect, getDashboardStats);

export default router;
