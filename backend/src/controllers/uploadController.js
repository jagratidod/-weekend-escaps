import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Upload media (image) to Cloudinary (or local fallback)
 * @route   POST /api/upload
 * @access  Protected (Admin only)
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload',
      });
    }

    const folder = req.body.folder || 'weekend_escapes/media';
    let fileUrl = '';
    let publicId = null;

    if (isCloudinaryConfigured()) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder,
        public_id: `${path.parse(req.file.originalname).name}-${Date.now()}`,
      });
      fileUrl = result.secure_url;
      publicId = result.public_id;
    } else {
      const mediaDir = path.join(__dirname, '../../uploads/media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `media-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(mediaDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/media/${filename}`;
    }

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      url: fileUrl,
      publicId,
      isCloudinary: isCloudinaryConfigured(),
    });
  } catch (error) {
    next(error);
  }
};
