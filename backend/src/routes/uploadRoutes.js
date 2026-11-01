import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import { uploadGenericMedia } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to accept either 'file' or 'image' field name
const handleUploadField = (req, res, next) => {
  const upload = uploadGenericMedia.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  upload(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = req.files['image']?.[0] || req.files['file']?.[0];
    }
    next();
  });
};

// Protected admin media upload endpoints (both / and /image)
router.post('/', protect, handleUploadField, uploadMedia);
router.post('/image', protect, handleUploadField, uploadMedia);

export default router;
