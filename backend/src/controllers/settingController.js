import Setting from '../models/Setting.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../services/cloudinaryService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DEFAULT_HOME_SECTIONS = {
  hero: {
    badge: 'EXPLORE • DISCOVER • ESCAPE',
    titleLine1: 'Your Next',
    titleHighlight: 'Adventure',
    titleLine2: 'Awaits',
    subtitle:
      'From majestic mountains to serene valleys, we craft unforgettable travel experiences for every explorer.',
    primaryButtonText: 'Explore Destinations',
    primaryButtonLink: '/destinations',
    heroImage: '/newimage/herosecction/heroimage.png',
    socialProof: {
      travelersText: '500+ Happy Travelers',
      rating: '4.9',
      reviewsText: '(500+ Reviews)',
      avatars: [
        '/images/testimonials/priya-sharma.webp',
        '/images/testimonials/rahul-verma.webp',
        '/images/testimonials/sneha-patel.webp',
      ],
      badgeCount: '500+',
    },
  },
  experiences: {
    badge: 'TRAVEL YOUR WAY',
    title: 'Choose Your Experience',
    subtitle: 'Every journey is unique. Find the travel style that matches you.',
    items: [
      { id: 'trekking', name: 'Trekking', icon: 'Mountain', link: '/experiences#trekking' },
      { id: 'adventure', name: 'Adventure', icon: 'Compass', link: '/experiences#adventure' },
      { id: 'honeymoon', name: 'Honeymoon', icon: 'Heart', link: '/experiences#honeymoon' },
      { id: 'family', name: 'Family Trips', icon: 'Users', link: '/experiences#family' },
      { id: 'group', name: 'Group Tours', icon: 'Flame', link: '/experiences#group' },
      { id: 'international', name: 'International', icon: 'Globe', link: '/experiences#international' },
    ],
  },
  whyChooseUs: {
    badge: 'WHY CHOOSE WEEKEND ESCAPES',
    title: 'More Than Just A Trip',
    subtitle:
      'We create meaningful travel experiences with care, expertise and a passion for exploration.',
    image: '/newimage/other sections image/image1.png',
    handwrittenNote: 'Travel even\nRepeat',
    benefits: [
      {
        icon: 'Mountain',
        title: 'Curated Experiences',
        desc: 'Handpicked destinations and verified stays',
      },
      {
        icon: 'Users',
        title: 'Expert Guidance',
        desc: 'Experienced travel leaders and local support',
      },
      {
        icon: 'Handshake',
        title: 'Safe & Secure Travel',
        desc: 'Your safety is our priority',
      },
      {
        icon: 'UsersRound',
        title: 'Best Price Guarantee',
        desc: 'Value-packed trips with no hidden costs',
      },
    ],
  },
  bookingProcess: {
    badge: 'OUR PROCESS',
    title: 'From Dream to Destination.',
    subtitle:
      'One continuous journey designed to make planning, booking, and exploring completely effortless.',
    steps: [
      {
        num: 1,
        stepNumber: '01',
        title: 'Explore',
        tagline: 'Curated Trails & Stays',
        desc: 'Browse our handpicked mountain treks, scenic road trips, and luxury weekend getaways.',
        icon: 'Compass',
      },
      {
        num: 2,
        stepNumber: '02',
        title: 'Plan',
        tagline: 'Bespoke Itinerary',
        desc: 'Customize dates, group sizes, and special preferences with our certified expedition marshals.',
        icon: 'CalendarDays',
      },
      {
        num: 3,
        stepNumber: '03',
        title: 'Book & Give Back',
        tagline: 'Secure & Gives Back',
        desc: 'Lock in slots with verified gateways. A share of every booking is donated to flood relief, food distribution & welfare trusts.',
        icon: 'ShieldCheck',
      },
      {
        num: 4,
        stepNumber: '04',
        title: 'Travel',
        tagline: 'Lifelong Memories',
        desc: 'Pack your bags, meet your trip leader at basecamp, and embark on your unforgettable escape.',
        icon: 'Plane',
      },
    ],
    welfare: {
      badge: 'Every Booking Gives Back',
      tagline: 'Travel With A Purpose',
      title: 'A Part of Your Trip Cost is Donated to Trusted Welfare & Relief Trusts',
      description:
        'Jab aap hamare saath apni trip book karte hain, aapke booking amount ka ek hissa direct verified relief trusts ko jata hai jisse zaroorat ke waqt real help provide ki ja sake:',
      items: [
        {
          icon: 'Waves',
          title: 'Flood & Calamity Relief',
          desc: 'Floods aur natural disasters ke waqt prompt rescue & rehabilitation help.',
          color: 'blue',
        },
        {
          icon: 'Utensils',
          title: 'Food & Ration Drives',
          desc: 'Remote aur underprivileged parivaron tak hygienic food aur ration supply.',
          color: 'emerald',
        },
        {
          icon: 'Heart',
          title: 'Community & Welfare',
          desc: 'Local mountain communities ki medical aid aur welfare support.',
          color: 'purple',
        },
      ],
    },
  },
  finalCta: {
    heading: 'Ready for Your Next Adventure?',
    subtitle:
      "Let's turn your travel dreams into unforgettable memories. Get personalized recommendations and plan your next escape.",
    bgImage: '/newimage/other sections image/footerbanner2.png',
    primaryButtonText: 'Explore Packages',
    primaryButtonLink: '/packages',
    whatsappButtonText: 'Talk on WhatsApp',
    whatsappUrl: '',
  },
};

// Helper to get or initialize default settings
const getOrCreateDefaultSettings = async () => {
  let settings = await Setting.findOne({ key: 'site_settings' });
  if (!settings) {
    settings = await Setting.create({
      key: 'site_settings',
      logoUrl: '/logo/weekend-escapes-logo.svg',
      siteName: 'Weekend Escapes',
      tagline: 'Crafting Adventures',
      whatsappNumber: '+91 98765 43210',
      whatsappMessage: 'Hi Weekend Escapes! I would like to plan my next adventure.',
      homeSections: DEFAULT_HOME_SECTIONS,
    });
  } else {
    let needsSave = false;

    if (!settings.whatsappNumber) {
      settings.whatsappNumber = (settings.contactInfo && settings.contactInfo.whatsapp) || '+91 98765 43210';
      if (!settings.whatsappMessage) {
        settings.whatsappMessage = 'Hi Weekend Escapes! I would like to plan my next adventure.';
      }
      needsSave = true;
    }

    if (!settings.homeSections) {
      settings.homeSections = DEFAULT_HOME_SECTIONS;
      needsSave = true;
    } else {
      ['hero', 'experiences', 'whyChooseUs', 'bookingProcess', 'finalCta'].forEach((sec) => {
        if (!settings.homeSections[sec]) {
          settings.homeSections[sec] = DEFAULT_HOME_SECTIONS[sec];
          needsSave = true;
        }
      });
    }

    if (needsSave) {
      settings.markModified('homeSections');
      await settings.save();
    }
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

// @desc    Upload / Update Website Footer Logo
// @route   POST /api/settings/footer-logo
// @access  Protected (Admin only)
export const updateFooterLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file (PNG, JPG, SVG, WebP)',
      });
    }

    const settings = await getOrCreateDefaultSettings();
    let footerLogoUrl = '';

    if (isCloudinaryConfigured()) {
      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'weekend_escapes/logos',
        public_id: `footer-logo-${Date.now()}`,
      });
      footerLogoUrl = cloudinaryResult.secure_url;
      console.log('[Cloudinary] Footer Logo uploaded successfully:', footerLogoUrl);
    } else {
      const logosDir = path.join(__dirname, '../../uploads/logos');
      if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
      }
      const ext = path.extname(req.file.originalname) || '.png';
      const filename = `footer-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(logosDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      footerLogoUrl = `/uploads/logos/${filename}`;
      console.log('[Local Upload] Saved footer logo to disk:', footerLogoUrl);
    }

    // Cleanup previous file if local disk
    if (
      settings.footerLogoUrl &&
      settings.footerLogoUrl.startsWith('/uploads/logos/') &&
      settings.footerLogoUrl !== footerLogoUrl
    ) {
      try {
        const oldFilePath = path.join(process.cwd(), settings.footerLogoUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (err) {
        console.warn('[Cleanup Warning] Could not delete old footer logo file:', err.message);
      }
    }

    settings.footerLogoUrl = footerLogoUrl;
    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Website footer logo updated successfully!',
      footerLogoUrl: settings.footerLogoUrl,
      settings,
    });
  } catch (error) {
    console.error('[UpdateFooterLogo Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating footer logo',
    });
  }
};

// @desc    Reset Footer Logo to Default SVG
// @route   POST /api/settings/footer-logo/reset
// @access  Protected (Admin only)
export const resetFooterLogo = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    settings.footerLogoUrl = '/logo/weekend-escapes-logo.svg';
    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Footer logo reset to default successfully!',
      footerLogoUrl: settings.footerLogoUrl,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting footer logo',
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
      whatsapp,
      whatsappNumber,
      mapUrl,
      socials,
    } = req.body;

    if (!settings.contactInfo) {
      settings.contactInfo = {};
    }

    const waNum = whatsapp !== undefined ? whatsapp : whatsappNumber;
    if (waNum !== undefined) {
      settings.contactInfo.whatsapp = waNum;
      settings.whatsappNumber = waNum;
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

// @desc    Update WhatsApp Number & Settings
// @route   PUT /api/settings/whatsapp
// @access  Protected (Admin only)
export const updateWhatsAppSettings = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    const { whatsappNumber, whatsappMessage } = req.body;

    if (whatsappNumber !== undefined) {
      settings.whatsappNumber = whatsappNumber;
      if (!settings.contactInfo) settings.contactInfo = {};
      settings.contactInfo.whatsapp = whatsappNumber;
    }

    if (whatsappMessage !== undefined) {
      settings.whatsappMessage = whatsappMessage;
    }

    settings.updatedBy = req.admin ? req.admin._id : null;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'WhatsApp settings updated successfully!',
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      settings,
    });
  } catch (error) {
    console.error('[UpdateWhatsAppSettings Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating WhatsApp settings',
    });
  }
};

// @desc    Update Home Page Dynamic Sections
// @route   PUT /api/settings/home-sections
// @access  Protected (Admin only)
export const updateHomeSections = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    const updates = req.body || {};

    if (!settings.homeSections) {
      settings.homeSections = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS));
    }

    // 1. Hero Section update
    if (updates.hero) {
      settings.homeSections.hero = {
        ...settings.homeSections.hero,
        ...updates.hero,
        socialProof: {
          ...settings.homeSections.hero?.socialProof,
          ...(updates.hero.socialProof || {}),
        },
      };
    }

    // 2. Experiences Section update
    if (updates.experiences) {
      settings.homeSections.experiences = {
        ...settings.homeSections.experiences,
        ...updates.experiences,
        items: Array.isArray(updates.experiences.items)
          ? updates.experiences.items
          : settings.homeSections.experiences?.items || [],
      };
    }

    // 3. Why Choose Us Section update
    if (updates.whyChooseUs) {
      settings.homeSections.whyChooseUs = {
        ...settings.homeSections.whyChooseUs,
        ...updates.whyChooseUs,
        benefits: Array.isArray(updates.whyChooseUs.benefits)
          ? updates.whyChooseUs.benefits
          : settings.homeSections.whyChooseUs?.benefits || [],
      };
    }

    // 4. Booking Process Section update
    if (updates.bookingProcess) {
      settings.homeSections.bookingProcess = {
        ...settings.homeSections.bookingProcess,
        ...updates.bookingProcess,
        steps: Array.isArray(updates.bookingProcess.steps)
          ? updates.bookingProcess.steps
          : settings.homeSections.bookingProcess?.steps || [],
        welfare: {
          ...settings.homeSections.bookingProcess?.welfare,
          ...(updates.bookingProcess.welfare || {}),
          items: Array.isArray(updates.bookingProcess.welfare?.items)
            ? updates.bookingProcess.welfare.items
            : settings.homeSections.bookingProcess?.welfare?.items || [],
        },
      };
    }

    // 5. Final CTA Section update
    if (updates.finalCta) {
      settings.homeSections.finalCta = {
        ...settings.homeSections.finalCta,
        ...updates.finalCta,
      };
    }

    settings.updatedBy = req.admin ? req.admin._id : null;
    settings.markModified('homeSections');
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Home page sections updated successfully!',
      homeSections: settings.homeSections,
      settings,
    });
  } catch (error) {
    console.error('[UpdateHomeSections Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating home sections',
    });
  }
};

// @desc    Reset Home Page Section to Default
// @route   POST /api/settings/home-sections/reset
// @access  Protected (Admin only)
export const resetHomeSection = async (req, res) => {
  try {
    const settings = await getOrCreateDefaultSettings();
    const { section } = req.body;

    if (!settings.homeSections) {
      settings.homeSections = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS));
    }

    if (!section || section === 'all') {
      settings.homeSections = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS));
    } else if (DEFAULT_HOME_SECTIONS[section]) {
      settings.homeSections[section] = JSON.parse(JSON.stringify(DEFAULT_HOME_SECTIONS[section]));
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid section name: ${section}`,
      });
    }

    settings.updatedBy = req.admin ? req.admin._id : null;
    settings.markModified('homeSections');
    await settings.save();

    res.status(200).json({
      success: true,
      message: `Section "${section || 'all'}" reset to default successfully!`,
      homeSections: settings.homeSections,
      settings,
    });
  } catch (error) {
    console.error('[ResetHomeSection Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting home section',
    });
  }
};
