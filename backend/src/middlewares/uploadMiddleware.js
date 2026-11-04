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

// Video & Poster file filter for Travel Reels
const reelFileFilter = (req, file, cb) => {
  const allowedExts = /mp4|webm|mov|mkv|jpg|jpeg|png|webp/;
  const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const isVideo = file.mimetype.startsWith('video/') || /mp4|webm|quicktime|x-matroska/.test(file.mimetype);
  const isImage = file.mimetype.startsWith('image/');

  if (extname && (isVideo || isImage)) {
    return cb(null, true);
  }
  return cb(
    new Error('Invalid file format. Only video files (.mp4, .mov, .webm) and poster images (.jpg, .png, .webp) are allowed.')
  );
};

// Travel Reel Upload Middleware: 20MB strict limit for video & poster
export const uploadReelMedia = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB maximum size restriction
  fileFilter: reelFileFilter,
});

