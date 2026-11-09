import Package from '../models/Package.js';
import PackageCategory from '../models/PackageCategory.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { DEFAULT_PACKAGES, seedDefaultPackages, seedFaqsForExistingPackages } from '../utils/seedPackages.js';

export const DEFAULT_PACKAGE_CATEGORIES = [
  { name: 'Trekking', slug: 'trekking', description: 'Himalayan and summit treks, high altitude mountain trails.', order: 1 },
  { name: 'Honeymoon & Leisure', slug: 'honeymoon-leisure', description: 'Romantic getaways, luxury houseboats, and serene resorts.', order: 2 },
  { name: 'Adventure', slug: 'adventure', description: 'River rafting, paragliding, ATV rides, and camping.', order: 3 },
  { name: 'International', slug: 'international', description: 'Exotic global destinations, private villas, and island tours.', order: 4 },
  { name: 'Weekend Escapes', slug: 'weekend-escapes', description: 'Quick weekend road trips and basecamp stays from major cities.', order: 5 },
  { name: 'Family Vacation', slug: 'family-vacation', description: 'Comfortable family journeys with sightseeing, safe stays, and curated itineraries.', order: 6 },
  { name: 'Spiritual & Heritage', slug: 'spiritual-heritage', description: 'Sacred pilgrimages, ancient temples, and heritage trails.', order: 7 },
];

/**
 * Seed default categories if none exist
 */
export const seedDefaultCategories = async () => {
  try {
    for (const cat of DEFAULT_PACKAGE_CATEGORIES) {
      await PackageCategory.findOneAndUpdate(
        { slug: cat.slug },
        { $setOnInsert: cat },
        { upsert: true, new: true }
      );
    }
    console.log('[PackageController] Default package categories ensured in DB');
  } catch (err) {
    console.error('[PackageController] Error seeding default categories:', err.message);
  }
};

/**
 * @desc    Get all categories (Public & Admin)
 * @route   GET /api/packages/categories/all
 * @access  Public
 */
export const getPackageCategories = async (req, res) => {
  try {
    const count = await PackageCategory.countDocuments();
    if (count === 0) {
      await seedDefaultCategories();
    }

    const { all } = req.query;
    const filter = all === 'true' ? {} : { isActive: true };

    const categories = await PackageCategory.find(filter).sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('[PackageController] getPackageCategories error:', error);
    res.status(200).json({
      success: true,
      count: DEFAULT_PACKAGE_CATEGORIES.length,
      categories: DEFAULT_PACKAGE_CATEGORIES,
      warning: 'Fallback to default categories',
    });
  }
};

/**
 * @desc    Create new package category
 * @route   POST /api/packages/categories
 * @access  Private (Admin)
 */
export const createPackageCategory = async (req, res) => {
  try {
    const { name, description, icon, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await PackageCategory.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists',
      });
    }

    const newCategory = await PackageCategory.create({
      name: name.trim(),
      slug,
      description: description || '',
      icon: icon || 'Compass',
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory,
    });
  } catch (error) {
    console.error('[PackageController] createPackageCategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

/**
 * @desc    Update existing package category
 * @route   PUT /api/packages/categories/:id
 * @access  Private (Admin)
 */
export const updatePackageCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order, isActive } = req.body;

    const category = await PackageCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name && name.trim() !== category.name) {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const existing = await PackageCategory.findOne({
        _id: { $ne: id },
        $or: [{ name: name.trim() }, { slug }],
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name already exists',
        });
      }

      category.name = name.trim();
      category.slug = slug;
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (order !== undefined) category.order = Number(order);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('[PackageController] updatePackageCategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete package category
 * @route   DELETE /api/packages/categories/:id
 * @access  Private (Admin)
 */
export const deletePackageCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await PackageCategory.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found to delete',
      });
    }

    res.status(200).json({
      success: true,
      message: `Category "${category.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('[PackageController] deletePackageCategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all packages (Public & Admin)
 * @route   GET /api/packages
 * @access  Public
 */
export const getPackages = async (req, res) => {
  try {
    // If no packages exist in DB, automatically seed defaults
    const count = await Package.countDocuments();
    if (count === 0) {
      await seedDefaultPackages();
    } else {
      // Auto-ensure FAQs on existing packages if missing
      await seedFaqsForExistingPackages();
    }

    const { search, type, maxPrice, trending, featured, all } = req.query;

    const filter = {};

    // Only active packages for public unless `all=true` (for admin)
    if (all !== 'true') {
      filter.isActive = true;
    }

    if (trending === 'true') {
      filter.isTrending = true;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (type && type !== 'All') {
      filter.travelType = { $regex: new RegExp(type, 'i') };
    }

    if (maxPrice) {
      const numMaxPrice = Number(maxPrice);
      if (!isNaN(numMaxPrice) && numMaxPrice > 0) {
        filter.price = { $lte: numMaxPrice };
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { location: regex }, { description: regex }];
    }

    const packages = await Package.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    console.error('[PackageController] getPackages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single package by ID or slug
 * @route   GET /api/packages/:id
 * @access  Public
 */
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    let pkg = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      pkg = await Package.findById(id);
    }

    if (!pkg) {
      pkg = await Package.findOne({ id: id });
    }

    if (!pkg) {
      // Fallback search in default packages
      const defaultPkg = DEFAULT_PACKAGES.find((p) => p.id === id);
      if (defaultPkg) {
        pkg = await Package.create(defaultPkg);
      }
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    res.status(200).json({
      success: true,
      package: pkg,
    });
  } catch (error) {
    console.error('[PackageController] getPackageById error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package details',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new package
 * @route   POST /api/packages
 * @access  Private (Admin)
 */
export const createPackage = async (req, res) => {
  try {
    const {
      name,
      badge,
      badgeColor,
      duration,
      location,
      price,
      originalPrice,
      rating,
      reviewsCount,
      image,
      gallery,
      travelType,
      difficulty,
      season,
      groupSize,
      included,
      excluded,
      itinerary,
      highlights,
      description,
      isFeatured,
      isTrending,
      isActive,
      order,
    } = req.body;

    if (!name || !duration || !location || !price || !image || !travelType) {
      return res.status(400).json({
        success: false,
        message: 'Name, duration, location, price, image, and travel type are required',
      });
    }

    // Generate slug id from name
    let slugId = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Ensure unique slug
    let existing = await Package.findOne({ id: slugId });
    if (existing) {
      slugId = `${slugId}-${Date.now().toString().slice(-4)}`;
    }

    const newPackage = await Package.create({
      id: slugId,
      name,
      badge: badge || '',
      badgeColor: badgeColor || 'bg-[#FF6B16] text-white',
      duration,
      location,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      pricingType: req.body.pricingType || 'standard',
      pricingTiers: Array.isArray(req.body.pricingTiers) ? req.body.pricingTiers : [],
      rating: rating ? Number(rating) : 4.9,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 100,
      image,
      gallery: Array.isArray(gallery) ? gallery : [],
      travelType,
      difficulty: difficulty || 'Easy to Moderate',
      season: season || 'All Year Round',
      groupSize: groupSize || '12 - 18 Explorers',
      included: Array.isArray(included) ? included : [],
      excluded: Array.isArray(excluded) ? excluded : [],
      itinerary: Array.isArray(itinerary) ? itinerary : [],
      faqs: Array.isArray(req.body.faqs) ? req.body.faqs : [],
      reels: Array.isArray(req.body.reels) ? req.body.reels.slice(0, 5) : [],
      availability: req.body.availability || {
        scheduleType: 'daily',
        defaultSeatsPerBatch: 16,
        minAdvanceNoticeDays: 1,
        batches: [],
        blackoutDates: [],
      },
      highlights: Array.isArray(highlights) ? highlights : [],
      description: description || '',
      isFeatured: Boolean(isFeatured),
      isTrending: isTrending !== undefined ? Boolean(isTrending) : true,
      isPrivateTrek: Boolean(req.body.isPrivateTrek),
      privateTrekNote: req.body.privateTrekNote || 'Direct WhatsApp Booking • Custom Batches',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: order !== undefined ? Number(order) : 0,
    });

    res.status(201).json({
      success: true,
      message: 'Tour package created successfully',
      package: newPackage,
    });
  } catch (error) {
    console.error('[PackageController] createPackage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: error.message,
    });
  }
};

/**
 * @desc    Update existing package
 * @route   PUT /api/packages/:id
 * @access  Private (Admin)
 */
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      pkg = await Package.findById(id);
    }
    if (!pkg) {
      pkg = await Package.findOne({ id: id });
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found to update',
      });
    }

    const fieldsToUpdate = [
      'name',
      'badge',
      'badgeColor',
      'duration',
      'location',
      'price',
      'originalPrice',
      'pricingType',
      'pricingTiers',
      'rating',
      'reviewsCount',
      'image',
      'gallery',
      'travelType',
      'difficulty',
      'season',
      'groupSize',
      'included',
      'excluded',
      'itinerary',
      'availability',
      'highlights',
      'faqs',
      'reels',
      'description',
      'isFeatured',
      'isTrending',
      'isPrivateTrek',
      'privateTrekNote',
      'isActive',
      'order',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'reels' && Array.isArray(req.body.reels)) {
          pkg.reels = req.body.reels.slice(0, 5);
        } else {
          pkg[field] = req.body[field];
        }
      }
    });

    await pkg.save();

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      package: pkg,
    });
  } catch (error) {
    console.error('[PackageController] updatePackage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete package
 * @route   DELETE /api/packages/:id
 * @access  Private (Admin)
 */
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      pkg = await Package.findByIdAndDelete(id);
    }
    if (!pkg) {
      pkg = await Package.findOneAndDelete({ id: id });
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found to delete',
      });
    }

    res.status(200).json({
      success: true,
      message: `Package "${pkg.name}" deleted successfully`,
    });
  } catch (error) {
    console.error('[PackageController] deletePackage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message,
    });
  }
};

/**
 * @desc    Reset / Seed default packages
 * @route   POST /api/packages/seed
 * @access  Private (Admin)
 */
export const resetToDefaultPackages = async (req, res) => {
  try {
    for (const defPkg of DEFAULT_PACKAGES) {
      await Package.findOneAndUpdate(
        { id: defPkg.id },
        { $set: defPkg },
        { upsert: true, new: true }
      );
    }

    const packages = await Package.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Default packages synced & restored successfully',
      packages,
    });
  } catch (error) {
    console.error('[PackageController] resetToDefaultPackages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed packages',
      error: error.message,
    });
  }
};

/**
 * @desc    Seed FAQs for all existing packages
 * @route   POST /api/packages/seed-faqs
 * @access  Private (Admin)
 */
export const seedExistingFaqs = async (req, res) => {
  try {
    const updatedCount = await seedFaqsForExistingPackages();
    const packages = await Package.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      message: `Successfully seeded FAQs for ${updatedCount} package(s)!`,
      packages,
    });
  } catch (error) {
    console.error('[PackageController] seedExistingFaqs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed existing FAQs',
      error: error.message,
    });
  }
};

/**
 * @desc    Check package availability for a specific date and group size
 * @route   GET /api/packages/:id/availability?date=YYYY-MM-DD&travelers=N
 * @access  Public
 */
export const checkPackageAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, travelers = 1 } = req.query;

    const numTravelers = Math.max(1, parseInt(travelers, 10) || 1);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Travel date is required (YYYY-MM-DD)',
      });
    }

    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      pkg = await Package.findById(id);
    }
    if (!pkg) {
      pkg = await Package.findOne({ id: id });
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    if (!pkg.isActive) {
      return res.status(200).json({
        success: true,
        available: false,
        status: 'sold_out',
        reason: 'This package is currently not taking new bookings',
      });
    }

    const avail = pkg.availability || {
      scheduleType: 'daily',
      defaultSeatsPerBatch: 16,
      minAdvanceNoticeDays: 1,
      batches: [],
      blackoutDates: [],
    };

    // 1. Date Validation: Past date or minimum notice check
    const selectedDate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD.',
      });
    }

    if (selectedDate < today) {
      return res.status(200).json({
        success: true,
        available: false,
        status: 'past_date',
        reason: 'Cannot select a past date',
      });
    }

    const minNoticeDays = avail.minAdvanceNoticeDays ?? 1;
    const noticeCutoff = new Date(today);
    noticeCutoff.setDate(noticeCutoff.getDate() + minNoticeDays);

    if (selectedDate < noticeCutoff) {
      return res.status(200).json({
        success: true,
        available: false,
        status: 'notice_required',
        reason: `Requires at least ${minNoticeDays} day(s) advance booking notice`,
      });
    }

    // 2. Blackout Dates check
    const isBlackedOut = avail.blackoutDates?.find((b) => b.date === date);
    if (isBlackedOut) {
      return res.status(200).json({
        success: true,
        available: false,
        status: 'blackout',
        reason: isBlackedOut.reason || 'Operational closure / holiday on this date',
      });
    }

    // 3. Specific Batch Check (Explicit batch matches date)
    const matchingBatch = avail.batches?.find((b) => b.startDate === date);

    if (matchingBatch) {
      const totalSeats = matchingBatch.totalSeats || avail.defaultSeatsPerBatch || 16;
      const bookedSeats = matchingBatch.bookedSeats || 0;
      const seatsLeft = Math.max(0, totalSeats - bookedSeats);

      if (matchingBatch.status === 'sold_out' || seatsLeft <= 0) {
        return res.status(200).json({
          success: true,
          available: false,
          seatsLeft: 0,
          status: 'sold_out',
          reason: 'This batch is completely Sold Out',
          batch: matchingBatch,
        });
      }

      if (seatsLeft < numTravelers) {
        return res.status(200).json({
          success: true,
          available: false,
          seatsLeft,
          status: 'insufficient_seats',
          reason: `Only ${seatsLeft} seat(s) remaining for this batch (Requested ${numTravelers})`,
          batch: matchingBatch,
        });
      }

      const finalStatus =
        matchingBatch.status === 'filling_fast' || seatsLeft <= 4
          ? 'filling_fast'
          : 'available';

      return res.status(200).json({
        success: true,
        available: true,
        seatsLeft,
        status: finalStatus,
        batch: matchingBatch,
        message:
          finalStatus === 'filling_fast'
            ? `Hurry! Only ${seatsLeft} seats left for this departure`
            : `Guaranteed Departure - ${seatsLeft} seats available`,
      });
    }

    // 4. If No Explicit Batch, check Schedule Type
    const scheduleType = avail.scheduleType || 'daily';

    // If strictly 'batches', and this date has no batch:
    if (scheduleType === 'batches') {
      return res.status(200).json({
        success: true,
        available: false,
        status: 'no_batch',
        reason: 'This tour operates on fixed departure batches only. Please choose an upcoming batch or contact us for a private trip.',
      });
    }

    // If 'weekends', check if day of week is Fri (5), Sat (6), or Sun (0)
    if (scheduleType === 'weekends') {
      const dayOfWeek = selectedDate.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
      if (!isWeekend) {
        return res.status(200).json({
          success: true,
          available: false,
          status: 'weekend_only',
          reason: 'This trip operates on weekends (Friday, Saturday, Sunday) only. You can also pick an upcoming weekend batch.',
        });
      }
    }

    // 5. Daily or Valid Weekend or Custom Day: Check DB Bookings count for capacity
    const defaultCapacity = avail.defaultSeatsPerBatch || 16;
    let bookedCount = 0;

    try {
      const existingBookings = await Booking.find({
        packageId: { $in: [pkg.id, pkg._id.toString()] },
        travelDate: date,
        bookingStatus: { $ne: 'cancelled' },
      });
      bookedCount = existingBookings.reduce((acc, b) => acc + (b.totalPersons || 1), 0);
    } catch (e) {
      console.warn('[PackageController] Error querying existing bookings:', e.message);
    }

    const seatsLeft = Math.max(0, defaultCapacity - bookedCount);

    if (seatsLeft <= 0) {
      return res.status(200).json({
        success: true,
        available: false,
        seatsLeft: 0,
        status: 'sold_out',
        reason: 'All slots booked for this date',
      });
    }

    if (seatsLeft < numTravelers) {
      return res.status(200).json({
        success: true,
        available: false,
        seatsLeft,
        status: 'insufficient_seats',
        reason: `Only ${seatsLeft} seat(s) left on this date (Requested ${numTravelers})`,
      });
    }

    const finalStatus = seatsLeft <= 4 ? 'filling_fast' : 'available';

    return res.status(200).json({
      success: true,
      available: true,
      seatsLeft,
      status: finalStatus,
      message:
        finalStatus === 'filling_fast'
          ? `High demand date! Only ${seatsLeft} seats left`
          : `Departure available! ${seatsLeft} seats open`,
    });
  } catch (error) {
    console.error('[PackageController] checkPackageAvailability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check package availability',
      error: error.message,
    });
  }
};

/**
 * @desc    Get upcoming departure slots and batches for a package
 * @route   GET /api/packages/:id/slots
 * @access  Public
 */
export const getUpcomingSlots = async (req, res) => {
  try {
    const { id } = req.params;

    let pkg = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      pkg = await Package.findById(id);
    }
    if (!pkg) {
      pkg = await Package.findOne({ id: id });
    }

    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    const avail = pkg.availability || {
      scheduleType: 'daily',
      defaultSeatsPerBatch: 16,
      minAdvanceNoticeDays: 1,
      batches: [],
      blackoutDates: [],
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const scheduleType = avail.scheduleType || 'daily';
    const slots = [];

    // Helper formatters
    const formatNiceDate = (dateStr) => {
      try {
        const d = new Date(`${dateStr}T00:00:00`);
        return d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        });
      } catch {
        return dateStr;
      }
    };

    // 1. Explicit upcoming batches
    if (avail.batches && avail.batches.length > 0) {
      const upcomingBatches = avail.batches
        .filter((b) => b.startDate >= todayStr)
        .sort((a, b) => a.startDate.localeCompare(b.startDate));

      upcomingBatches.forEach((b) => {
        const total = b.totalSeats || avail.defaultSeatsPerBatch || 16;
        const booked = b.bookedSeats || 0;
        const left = Math.max(0, total - booked);
        slots.push({
          date: b.startDate,
          endDate: b.endDate || '',
          label: formatNiceDate(b.startDate),
          totalSeats: total,
          seatsLeft: left,
          status:
            b.status === 'sold_out' || left <= 0
              ? 'sold_out'
              : b.status === 'filling_fast' || left <= 4
              ? 'filling_fast'
              : 'available',
          note: b.note || '',
          isBatch: true,
        });
      });
    }

    // 2. If schedule is 'weekends' and not enough batches defined, auto-generate upcoming weekends
    if (scheduleType === 'weekends' && slots.length < 8) {
      const existingDates = new Set(slots.map((s) => s.date));
      const blackoutSet = new Set((avail.blackoutDates || []).map((b) => b.date));

      const cursor = new Date();
      cursor.setDate(cursor.getDate() + (avail.minAdvanceNoticeDays || 1));

      for (let i = 0; i < 45 && slots.length < 10; i++) {
        const dayOfWeek = cursor.getDay();
        const dateStr = cursor.toISOString().split('T')[0];

        if (
          (dayOfWeek === 5 || dayOfWeek === 6) &&
          !existingDates.has(dateStr) &&
          !blackoutSet.has(dateStr)
        ) {
          slots.push({
            date: dateStr,
            endDate: '',
            label: formatNiceDate(dateStr),
            totalSeats: avail.defaultSeatsPerBatch || 16,
            seatsLeft: avail.defaultSeatsPerBatch || 16,
            status: 'available',
            note: dayOfWeek === 5 ? 'Friday Weekend Departure' : 'Saturday Weekend Departure',
            isBatch: false,
          });
          existingDates.add(dateStr);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // 3. If schedule is 'daily' and not enough slots, auto-generate next 14 daily slots
    if ((scheduleType === 'daily' || scheduleType === 'custom') && slots.length < 10) {
      const existingDates = new Set(slots.map((s) => s.date));
      const blackoutSet = new Set((avail.blackoutDates || []).map((b) => b.date));

      const cursor = new Date();
      cursor.setDate(cursor.getDate() + (avail.minAdvanceNoticeDays || 1));

      for (let i = 0; i < 30 && slots.length < 14; i++) {
        const dateStr = cursor.toISOString().split('T')[0];
        if (!existingDates.has(dateStr) && !blackoutSet.has(dateStr)) {
          slots.push({
            date: dateStr,
            endDate: '',
            label: formatNiceDate(dateStr),
            totalSeats: avail.defaultSeatsPerBatch || 16,
            seatsLeft: avail.defaultSeatsPerBatch || 16,
            status: 'available',
            note: 'Daily Departure',
            isBatch: false,
          });
          existingDates.add(dateStr);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Sort final slots chronologically
    slots.sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      scheduleType,
      defaultSeats: avail.defaultSeatsPerBatch || 16,
      minAdvanceNoticeDays: avail.minAdvanceNoticeDays || 1,
      slots,
    });
  } catch (error) {
    console.error('[PackageController] getUpcomingSlots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming slots',
      error: error.message,
    });
  }
};

