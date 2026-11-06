import Reel from '../models/Reel.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback seed reels to guarantee public UI is never empty
const DEFAULT_SEED_REELS = [
  {
    author: 'Xplorer Anil',
    trek: 'KEDARKANTHA TREK',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/exploresection/kedarkantha.png',
    fileSize: 4500000,
    isActive: true,
    order: 1,
  },
  {
    author: 'Jove Singh',
    trek: 'KEDARKANTHA TREK',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/about/kedarkantha.png',
    fileSize: 5200000,
    isActive: true,
    order: 2,
  },
  {
    author: 'Anil Yogi',
    trek: 'KEDARKANTHA TREK',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/exploresection/manali.png',
    fileSize: 4800000,
    isActive: true,
    order: 3,
  },
  {
    author: 'Adarsh Tiwari',
    trek: 'KEDARKANTHA TREK',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/about/image1.png',
    fileSize: 4900000,
    isActive: true,
    order: 4,
  },
  {
    author: 'Priya Sharma',
    trek: 'KEDARKANTHA TREK',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/about/kashmir.png',
    fileSize: 4600000,
    isActive: true,
    order: 5,
  },
  {
    author: 'Vikram Singhania',
    trek: 'SPITI VALLEY EXPEDITION',
    video: '/videos/reels/trip-reel-1.mp4',
    poster: '/newimage/about/vally.png',
    fileSize: 5800000,
    isActive: true,
    order: 6,
  },
];

/**
 * @desc    Upload reel video or poster to Cloudinary with strict 20MB restriction
 * @route   POST /api/reels/upload
 * @access  Protected (Admin only)
 */
export const uploadReelMediaFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video or image file provided for upload',
      });
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB limit
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds the 20MB limit. Current size is ${(req.file.size / (1024 * 1024)).toFixed(2)} MB. Please compress or choose a smaller file.`,
      });
    }

    const isVideo =
      req.file.mimetype.startsWith('video/') ||
      /\.(mp4|mov|webm|mkv)$/i.test(req.file.originalname);

    const folder = isVideo ? 'weekend_escapes/reels' : 'weekend_escapes/reels/posters';
    let fileUrl = '';
    let posterUrl = '';
    let publicId = null;
    let duration = 0;

    if (isCloudinaryConfigured()) {
      const uploadOptions = {
        folder,
        resource_type: isVideo ? 'video' : 'image',
      };

      const result = await uploadBufferToCloudinary(req.file.buffer, uploadOptions);
      fileUrl = result.secure_url;
      publicId = result.public_id;
      duration = result.duration || 0;

      // For video uploads, Cloudinary can automatically generate an image poster
      if (isVideo) {
        posterUrl = result.secure_url.replace(/\.[^/.]+$/, '.jpg');
      } else {
        posterUrl = result.secure_url;
      }
    } else {
      // Local disk fallback
      const uploadSubdir = isVideo ? 'reels' : 'reels/posters';
      const targetDir = path.join(__dirname, `../../uploads/${uploadSubdir}`);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || (isVideo ? '.mp4' : '.jpg');
      const filename = `reel-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(targetDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      fileUrl = `/uploads/${uploadSubdir}/${filename}`;
      posterUrl = fileUrl;
    }

    res.status(200).json({
      success: true,
      message: `${isVideo ? 'Video' : 'Poster'} uploaded successfully`,
      url: fileUrl,
      posterUrl,
      publicId,
      isVideo,
      fileSize: req.file.size,
      duration,
      isCloudinary: isCloudinaryConfigured(),
    });
  } catch (error) {
    console.error('[Reel Upload Error]', error);
    next(error);
  }
};

/**
 * @desc    Get active reels for public homepage
 * @route   GET /api/reels
 * @access  Public
 */
export const getPublicReels = async (req, res, next) => {
  try {
    let reels = await Reel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

    // Auto-seed default reels if database has none
    if (!reels || reels.length === 0) {
      try {
        await Reel.insertMany(DEFAULT_SEED_REELS);
        reels = await Reel.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
      } catch (seedErr) {
        console.warn('[Reel Auto-Seed Warning]', seedErr.message);
        // If DB write failed, return memory seed
        return res.status(200).json({
          success: true,
          count: DEFAULT_SEED_REELS.length,
          data: DEFAULT_SEED_REELS,
        });
      }
    }

    res.status(200).json({
      success: true,
      count: reels.length,
      data: reels,
    });
  } catch (error) {
    console.error('[Get Public Reels Error]', error);
    // Fallback gracefully so frontend carousel never breaks
    res.status(200).json({
      success: true,
      count: DEFAULT_SEED_REELS.length,
      data: DEFAULT_SEED_REELS,
    });
  }
};

/**
 * @desc    Get all reels for admin panel
 * @route   GET /api/reels/admin
 * @access  Protected (Admin only)
 */
export const getAdminReels = async (req, res, next) => {
  try {
    const reels = await Reel.find().sort({ order: 1, createdAt: -1 });
    const totalCount = reels.length;
    const activeCount = reels.filter((r) => r.isActive).length;
    const inactiveCount = totalCount - activeCount;

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
      },
      data: reels,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new reel
 * @route   POST /api/reels
 * @access  Protected (Admin only)
 */
export const createReel = async (req, res, next) => {
  try {
    const {
      author,
      trek,
      video,
      videoPublicId,
      poster,
      posterPublicId,
      fileSize,
      duration,
      isActive,
      order,
    } = req.body;

    if (!author || !trek || !video) {
      return res.status(400).json({
        success: false,
        message: 'Author name, trek destination, and video URL are required',
      });
    }

    // Auto-generate poster if missing and Cloudinary video is used
    let resolvedPoster = poster;
    if (!resolvedPoster && typeof video === 'string' && video.includes('cloudinary.com')) {
      resolvedPoster = video.replace(/\.[^/.]+$/, '.jpg');
    }

    const reel = await Reel.create({
      author: author.trim(),
      trek: trek.trim(),
      video: video.trim(),
      videoPublicId: videoPublicId || null,
      poster: resolvedPoster ? resolvedPoster.trim() : '',
      posterPublicId: posterPublicId || null,
      fileSize: Number(fileSize) || 0,
      duration: Number(duration) || 0,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      order: Number(order) || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing reel
 * @route   PUT /api/reels/:id
 * @access  Protected (Admin only)
 */
export const updateReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      author,
      trek,
      video,
      videoPublicId,
      poster,
      posterPublicId,
      fileSize,
      duration,
      isActive,
      order,
    } = req.body;

    let reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    if (author) reel.author = author.trim();
    if (trek) reel.trek = trek.trim();
    if (video) reel.video = video.trim();
    if (videoPublicId !== undefined) reel.videoPublicId = videoPublicId;
    if (poster !== undefined) reel.poster = poster.trim();
    if (posterPublicId !== undefined) reel.posterPublicId = posterPublicId;
    if (fileSize !== undefined) reel.fileSize = Number(fileSize);
    if (duration !== undefined) reel.duration = Number(duration);
    if (isActive !== undefined) reel.isActive = Boolean(isActive);
    if (order !== undefined) reel.order = Number(order);

    await reel.save();

    res.status(200).json({
      success: true,
      message: 'Reel updated successfully',
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle reel active status
 * @route   PATCH /api/reels/:id/toggle
 * @access  Protected (Admin only)
 */
export const toggleReelStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    reel.isActive = !reel.isActive;
    await reel.save();

    res.status(200).json({
      success: true,
      message: `Reel status changed to ${reel.isActive ? 'Active' : 'Inactive'}`,
      data: reel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a reel and purge its files from Cloudinary
 * @route   DELETE /api/reels/:id
 * @access  Protected (Admin only)
 */
export const deleteReel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    // Purge video from Cloudinary if public ID exists
    if (reel.videoPublicId) {
      try {
        await deleteFromCloudinary(reel.videoPublicId, { resource_type: 'video' });
      } catch (cloudErr) {
        console.warn('[Cloudinary Video Deletion Warning]', cloudErr.message);
      }
    }

    // Purge poster from Cloudinary if public ID exists
    if (reel.posterPublicId) {
      try {
        await deleteFromCloudinary(reel.posterPublicId, { resource_type: 'image' });
      } catch (cloudErr) {
        console.warn('[Cloudinary Poster Deletion Warning]', cloudErr.message);
      }
    }

    await Reel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Reel deleted successfully from database and Cloudinary storage',
    });
  } catch (error) {
    next(error);
  }
};
