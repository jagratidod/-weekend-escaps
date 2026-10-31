import multer from 'multer';
import path from 'path';

// Memory storage keeps file buffers in memory for direct Cloudinary upload
const memoryStorage = multer.memoryStorage();

// File filter (SVG, PNG, JPG, JPEG, WebP)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg\+xml|svg/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype =
    allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only SVG, PNG, JPG, JPEG, and WebP images are allowed!'));
  }
};

export const uploadMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

export const uploadLogo = uploadMemory;
export const uploadTestimonialImage = uploadMemory;
export const uploadGenericMedia = uploadMemory;
