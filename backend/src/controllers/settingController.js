import Setting from '../models/Setting.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get or initialize default settings
const getOrCreateDefaultSettings = async () => {
  let settings = await Setting.findOne({ key: 'site_settings' });
  if (!settings) {
    settings = await Setting.create({
      key: 'site_settings',
      logoUrl: '/logo/weekend-escapes-logo.svg',
      siteName: 'Weekend Escapes',
      tagline: 'Crafting Adventures',
    });
  }
  return settings;
};

// @desc    Get Public Site Settings (Logo, Site Name)
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('[GetSettings Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching site settings',
    });
  }
};

// @desc    Upload / Update Website Logo
// @route   POST /api/settings/logo
// @access  Protected (Admin only)
export const updateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (PNG, JPG, SVG, WebP)',
      });
    }

    const settings = await getOrCreateDefaultSettings();
    let logoUrl = '';

    if (isCloudinaryConfigured()) {
      // Direct Cloudinary Upload from memory buffer
      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'weekend_escapes/logos',
        public_id: `site-logo-${Date.now()}`,
      });
      logoUrl = cloudinaryResult.secure_url;
      console.log('[Cloudinary] Logo uploaded successfully:', logoUrl);
    } else {
      // Local disk fallback
      const logosDir = path.join(__dirname, '../../uploads/logos');
      if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `site-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(logosDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      logoUrl = `/uploads/logos/${filename}`;
      console.log('[Local Upload] Saved logo to disk:', logoUrl);
    }

    // Optionally delete previous custom logo if it was a disk file
    if (
      settings.logoUrl &&
      settings.logoUrl.startsWith('/uploads/logos/') &&
      settings.logoUrl !== logoUrl
    ) {
      try {
        const oldFilePath = path.join(process.cwd(), settings.logoUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.warn('[Cleanup Warning] Could not delete old logo file:', err.message);
      }
    }

    settings.logoUrl = logoUrl;
    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Website logo updated successfully!',
      logoUrl: settings.logoUrl,
      settings,
    });
  } catch (error) {
    console.error('[UpdateLogo Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating logo',
    });
  }
};

// @desc    Reset Logo to Default SVG
// @route   POST /api/settings/logo/reset
// @access  Protected (Admin only)
export const resetLogo = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    settings.logoUrl = '/logo/weekend-escapes-logo.svg';
    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Logo reset to default successfully!',
      logoUrl: settings.logoUrl,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting logo',
    });
  }
};

// @desc    Update Contact Page Info
// @route   PUT /api/settings/contact
// @access  Protected (Admin only)
export const updateContactInfo = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();

    const {
      heroTitle,
      heroSubtitle,
      address,
      emailPrimary,
      emailSupport,
      phone,
      helpline,
      mapUrl,
      socials,
    } = req.body;

    if (!settings.contactInfo) {
      settings.contactInfo = {};
    }

    if (heroTitle !== undefined) settings.contactInfo.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.contactInfo.heroSubtitle = heroSubtitle;
    if (address !== undefined) settings.contactInfo.address = address;
    if (emailPrimary !== undefined) settings.contactInfo.emailPrimary = emailPrimary;
    if (emailSupport !== undefined) settings.contactInfo.emailSupport = emailSupport;
    if (phone !== undefined) settings.contactInfo.phone = phone;
    if (helpline !== undefined) settings.contactInfo.helpline = helpline;
    if (mapUrl !== undefined) settings.contactInfo.mapUrl = mapUrl;

    if (socials && typeof socials === 'object') {
      if (!settings.contactInfo.socials) settings.contactInfo.socials = {};
      if (socials.facebook !== undefined) settings.contactInfo.socials.facebook = socials.facebook;
      if (socials.instagram !== undefined) settings.contactInfo.socials.instagram = socials.instagram;
      if (socials.twitter !== undefined) settings.contactInfo.socials.twitter = socials.twitter;
      if (socials.youtube !== undefined) settings.contactInfo.socials.youtube = socials.youtube;
    }

    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Contact page information updated successfully!',
      contactInfo: settings.contactInfo,
      settings,
    });
  } catch (error) {
    console.error('[UpdateContactInfo Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating contact info',
    });
  }
};
