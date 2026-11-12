import Coupon from '../models/Coupon.js';

// Helper to normalize phone number to last 10 digits
const extract10DigitPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

// Helper to clean array or comma-separated string of phones
const sanitizePhonesList = (input) => {
  if (!input) return [];
  const rawList = Array.isArray(input) ? input : String(input).split(',');
  return rawList
    .map((p) => extract10DigitPhone(p))
    .filter((p) => p && p.length === 10);
};

// Helper to normalize expiry date to end-of-day so coupon remains valid all day
const parseExpiryDate = (input) => {
  if (!input) return null;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  if (typeof input === 'string' && input.length === 10) {
    d.setUTCHours(23, 59, 59, 999);
  }
  return d;
};

/**
 * Public Endpoint: Discover available coupons for a booking / customer
 * GET /api/coupons/available
 * Query: ?phone=...&packageId=...&subtotal=...&totalPersons=...
 */
export const getAvailableCoupons = async (req, res) => {
  try {
    const { phone, packageId, subtotal = 0, totalPersons = 1 } = req.query;
    const cleanPhone = extract10DigitPhone(phone);
    const parsedSubtotal = Number(subtotal) || 0;
    const parsedPersons = Number(totalPersons) || 1;
    const now = new Date();

    // Query active coupons
    const query = {
      isActive: true,
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }],
      $and: [
        {
          $or: [{ startDate: null }, { startDate: { $lte: now } }],
        },
      ],
    };

    const allActive = await Coupon.find(query).sort({ createdAt: -1 });

    const exclusiveCoupons = [];
    const publicCoupons = [];

    for (const c of allActive) {
      // Check usage limit
      if (c.usageLimit && c.usedCount >= c.usageLimit) {
        continue;
      }

      // Check min booking amount if subtotal provided
      if (parsedSubtotal > 0 && c.minBookingAmount && parsedSubtotal < c.minBookingAmount) {
        // Can still show with an info tag "Add more to unlock", but we will show eligible ones
      }

      // Check package restriction
      if (c.applicablePackages && c.applicablePackages.length > 0 && packageId) {
        const isPkgMatch = c.applicablePackages.some(
          (pkg) => pkg.toString() === packageId.toString()
        );
        if (!isPkgMatch) continue;
      }

      // Check target type
      if (c.targetType === 'specific_users') {
        // Must match user phone
        if (cleanPhone && c.assignedPhones && c.assignedPhones.includes(cleanPhone)) {
          const discountCalc = c.calculateDiscount({
            subtotal: parsedSubtotal,
            totalPersons: parsedPersons,
            packageId,
            phone: cleanPhone,
          });

          exclusiveCoupons.push({
            _id: c._id,
            code: c.code,
            title: c.title || `Exclusive Offer for ${cleanPhone}`,
            description: c.description || 'Special personalized discount for your booking',
            discountType: c.discountType,
            discountValue: c.discountValue,
            maxDiscount: c.maxDiscount,
            minBookingAmount: c.minBookingAmount,
            expiryDate: c.expiryDate,
            isExclusive: true,
            assignedPhone: cleanPhone,
            estimatedDiscount: discountCalc.valid ? discountCalc.discountAmount : 0,
            meetsMinSubtotal: parsedSubtotal >= (c.minBookingAmount || 0),
          });
        }
      } else {
        // Public / General coupon
        const discountCalc = c.calculateDiscount({
          subtotal: parsedSubtotal,
          totalPersons: parsedPersons,
          packageId,
          phone: cleanPhone,
        });

        publicCoupons.push({
          _id: c._id,
          code: c.code,
          title: c.title || c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          maxDiscount: c.maxDiscount,
          minBookingAmount: c.minBookingAmount,
          expiryDate: c.expiryDate,
          isExclusive: false,
          estimatedDiscount: discountCalc.valid ? discountCalc.discountAmount : 0,
          meetsMinSubtotal: parsedSubtotal >= (c.minBookingAmount || 0),
        });
      }
    }

    return res.status(200).json({
      success: true,
      hasExclusive: exclusiveCoupons.length > 0,
      userPhone: cleanPhone || null,
      coupons: [...exclusiveCoupons, ...publicCoupons],
    });
  } catch (error) {
    console.error('[getAvailableCoupons] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve available coupons',
      error: error.message,
    });
  }
};

/**
 * Public Validation endpoint for booking checkout
 * POST /api/coupons/validate
 * Body: { code, subtotal, totalPersons, packageId, phone }
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal = 0, totalPersons = 1, packageId, phone } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please enter a coupon code.',
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Coupon code "${cleanCode}" is invalid or expired.`,
      });
    }

    const result = coupon.calculateDiscount({
      subtotal: Number(subtotal) || 0,
      totalPersons: Number(totalPersons) || 1,
      packageId,
      phone: extract10DigitPhone(phone),
    });

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      discountAmount: result.discountAmount,
      coupon: result.coupon,
      message: result.message,
    });
  } catch (error) {
    console.error('[validateCoupon] Error:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to validate coupon code. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Admin: Get all coupons
 * GET /api/coupons
 */
export const getAllCoupons = async (req, res) => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await autoSeedDefaults();
    }

    const coupons = await Coupon.find().sort({ createdAt: -1 });

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.isActive).length;
    const totalRedemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

    return res.status(200).json({
      success: true,
      coupons,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
      },
    });
  } catch (error) {
    console.error('[getAllCoupons] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message,
    });
  }
};

/**
 * Admin: Create a new coupon
 * POST /api/coupons
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      startDate,
      expiryDate,
      usageLimit,
      targetType,
      assignedPhones,
      applicablePackages,
      isActive,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required.',
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A coupon with code "${normalizedCode}" already exists.`,
      });
    }

    if (discountValue === undefined || discountValue === null || Number(discountValue) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid non-negative discount value.',
      });
    }

    if (discountType === 'percentage' && Number(discountValue) > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%.',
      });
    }

    const cleanedPhones = sanitizePhonesList(assignedPhones);
    const chosenTarget = targetType === 'specific_users' ? 'specific_users' : 'all';

    if (chosenTarget === 'specific_users' && cleanedPhones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one valid 10-digit mobile number for specific user coupon.',
      });
    }

    const newCoupon = new Coupon({
      code: normalizedCode,
      title: title?.trim() || '',
      description: description?.trim() || '',
      discountType: discountType || 'flat',
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
      startDate: startDate ? new Date(startDate) : null,
      expiryDate: parseExpiryDate(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      targetType: chosenTarget,
      assignedPhones: cleanedPhones,
      applicablePackages: Array.isArray(applicablePackages) ? applicablePackages : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await newCoupon.save();

    return res.status(201).json({
      success: true,
      message: `Coupon "${normalizedCode}" created successfully.`,
      coupon: newCoupon,
    });
  } catch (error) {
    console.error('[createCoupon] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message,
    });
  }
};

/**
 * Admin: Update an existing coupon
 * PUT /api/coupons/:id
 */
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      startDate,
      expiryDate,
      usageLimit,
      targetType,
      assignedPhones,
      applicablePackages,
      isActive,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    if (code) {
      const normalizedCode = code.trim().toUpperCase();
      if (normalizedCode !== coupon.code) {
        const existing = await Coupon.findOne({ code: normalizedCode });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Coupon code "${normalizedCode}" is already taken.`,
          });
        }
        coupon.code = normalizedCode;
      }
    }

    if (title !== undefined) coupon.title = title.trim();
    if (description !== undefined) coupon.description = description.trim();
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) {
      if (Number(discountValue) < 0 || (coupon.discountType === 'percentage' && Number(discountValue) > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount value.',
        });
      }
      coupon.discountValue = Number(discountValue);
    }
    if (maxDiscount !== undefined) {
      coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    }
    if (minBookingAmount !== undefined) {
      coupon.minBookingAmount = minBookingAmount ? Number(minBookingAmount) : 0;
    }
    if (startDate !== undefined) {
      coupon.startDate = startDate ? new Date(startDate) : null;
    }
    if (expiryDate !== undefined) {
      coupon.expiryDate = parseExpiryDate(expiryDate);
    }
    if (usageLimit !== undefined) {
      coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    }
    if (targetType !== undefined) {
      coupon.targetType = targetType === 'specific_users' ? 'specific_users' : 'all';
    }
    if (assignedPhones !== undefined) {
      coupon.assignedPhones = sanitizePhonesList(assignedPhones);
    }
    if (applicablePackages !== undefined) {
      coupon.applicablePackages = Array.isArray(applicablePackages) ? applicablePackages : [];
    }
    if (isActive !== undefined) {
      coupon.isActive = Boolean(isActive);
    }

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" updated successfully.`,
      coupon,
    });
  } catch (error) {
    console.error('[updateCoupon] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message,
    });
  }
};

/**
 * Admin: Toggle coupon active/inactive status
 * PATCH /api/coupons/:id/toggle
 */
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" is now ${coupon.isActive ? 'Active' : 'Inactive'}.`,
      isActive: coupon.isActive,
      coupon,
    });
  } catch (error) {
    console.error('[toggleCouponStatus] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle coupon status',
      error: error.message,
    });
  }
};

/**
 * Admin: Delete a coupon
 * DELETE /api/coupons/:id
 */
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon "${deleted.code}" deleted successfully.`,
    });
  } catch (error) {
    console.error('[deleteCoupon] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message,
    });
  }
};

/**
 * Helper to auto seed defaults
 */
async function autoSeedDefaults() {
  const defaults = [
    {
      code: 'EARLYBIRD',
      title: 'Early Bird Special Offer',
      description: 'Get ₹1,000 off per person (capped at 20% of subtotal)',
      discountType: 'per_person',
      discountValue: 1000,
      maxDiscount: 4000,
      minBookingAmount: 5000,
      targetType: 'all',
      isActive: true,
    },
    {
      code: 'WEEKEND10',
      title: '10% Weekend Getaway Special',
      description: 'Flat 10% discount on entire package subtotal',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscount: 5000,
      minBookingAmount: 3000,
      targetType: 'all',
      isActive: true,
    },
    {
      code: 'ESCAPE500',
      title: 'Flat ₹500 Welcome Discount',
      description: 'Instant ₹500 off on any booking',
      discountType: 'flat',
      discountValue: 500,
      minBookingAmount: 2000,
      targetType: 'all',
      isActive: true,
    },
  ];

  for (const item of defaults) {
    const exists = await Coupon.findOne({ code: item.code });
    if (!exists) {
      await Coupon.create(item);
    }
  }
}

/**
 * Admin: Trigger manual seed of defaults
 * POST /api/coupons/seed
 */
export const seedCoupons = async (req, res) => {
  try {
    await autoSeedDefaults();
    const all = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Default coupons verified/seeded successfully.',
      coupons: all,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to seed default coupons',
      error: error.message,
    });
  }
};
