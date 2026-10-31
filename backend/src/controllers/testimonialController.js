import Testimonial from '../models/Testimonial.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Upload traveler photo
 * @route   POST /api/testimonials/upload
 * @access  Public
 */
export const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded',
      });
    }

    let fileUrl = '';

    if (isCloudinaryConfigured()) {
      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'weekend_escapes/testimonials',
        public_id: `traveler-${Date.now()}`,
      });
      fileUrl = cloudinaryResult.secure_url;
      console.log('[Cloudinary] Testimonial photo uploaded:', fileUrl);
    } else {
      const testimonialsDir = path.join(__dirname, '../../uploads/testimonials');
      if (!fs.existsSync(testimonialsDir)) {
        fs.mkdirSync(testimonialsDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `traveler-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(testimonialsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      fileUrl = `/uploads/testimonials/${filename}`;
      console.log('[Local Upload] Saved testimonial photo to disk:', fileUrl);
    }

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      imageUrl: fileUrl,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a new testimonial/review (Public)
 * @route   POST /api/testimonials
 * @access  Public
 */
export const createTestimonial = async (req, res, next) => {
  try {
    const { name, trip, location, image, rating, quote, badge } = req.body;

    if (!name || !trip || !quote) {
      return res.status(400).json({
        success: false,
        message: 'Name, Trip, and Review text are required',
      });
    }

    const testimonial = await Testimonial.create({
      name,
      trip,
      location: location || '',
      image: image || '/images/testimonials/priya-sharma-card.png',
      rating: Number(rating) || 5,
      quote,
      badge: badge || 'Adventurer',
      status: 'pending', // Requires Admin Approval before showing on website
    });

    console.log(`[New Testimonial - Pending Approval] By ${testimonial.name} for ${testimonial.trip}`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted and is awaiting approval by our expedition team.',
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all APPROVED testimonials (Public for Website UI)
 * @route   GET /api/testimonials
 * @access  Public
 */
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all testimonials for Admin with metrics & filters
 * @route   GET /api/testimonials/admin
 * @access  Protected (Admin only)
 */
export const getAdminTestimonials = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { trip: searchRegex },
        { location: searchRegex },
        { quote: searchRegex },
        { badge: searchRegex },
      ];
    }

    const [testimonials, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Testimonial.find(query).sort({ createdAt: -1 }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ status: 'pending' }),
      Testimonial.countDocuments({ status: 'approved' }),
      Testimonial.countDocuments({ status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update testimonial status (approve / reject / pending)
 * @route   PUT /api/testimonials/:id/status
 * @access  Protected (Admin only)
 */
export const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected',
      });
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    console.log(`[Testimonial Moderated] ID ${id} set to status: ${status}`);

    res.status(200).json({
      success: true,
      message: `Testimonial has been marked as ${status}`,
      data: testimonial,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a testimonial
 * @route   DELETE /api/testimonials/:id
 * @access  Protected (Admin only)
 */
export const deleteTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully',
      data: { id },
    });
  } catch (error) {
    next(error);
  }
};
