import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import { uploadGenericMedia } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected admin media upload endpoint
router.post('/', protect, uploadGenericMedia.single('file'), uploadMedia);

export default router;
