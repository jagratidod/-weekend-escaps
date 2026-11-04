import express from 'express';
import {
  getPublicReels,
  getAdminReels,
  uploadReelMediaFile,
  createReel,
  updateReel,
  toggleReelStatus,
  deleteReel,
} from '../controllers/reelController.js';
import { uploadReelMedia } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to accept either 'file' or 'video' or 'poster' field name
const handleReelUploadField = (req, res, next) => {
  const upload = uploadReelMedia.fields([
    { name: 'file', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds the 20MB limit. Please compress or choose a smaller video.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
      });
    }
    if (req.files) {
      req.file =
        req.files['file']?.[0] ||
        req.files['video']?.[0] ||
        req.files['poster']?.[0];
    }
    next();
  });
};

// Public route for homepage
router.get('/', getPublicReels);

// Protected Admin routes
router.get('/admin', protect, getAdminReels);
router.post('/upload', protect, handleReelUploadField, uploadReelMediaFile);
router.post('/', protect, createReel);
router.put('/:id', protect, updateReel);
router.patch('/:id/toggle', protect, toggleReelStatus);
router.delete('/:id', protect, deleteReel);

export default router;
