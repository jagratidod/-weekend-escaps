import Booking from '../models/Booking.js';
import Lead from '../models/Lead.js';

// Helper to generate a unique human-friendly booking reference
const generateBookingRef = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `WE-${year}-${randomPart}`;
};

// Helper to check if any traveler has medical disclosures
const detectMedicalAlert = (travelers = []) => {
  const ignoreKeywords = ['none', 'no', 'nil', 'na', 'n/a', 'nothing', 'good', 'fit', 'healthy', ''];
  return travelers.some((t) => {
    if (!t.medical) return false;
    const cleaned = t.medical.trim().toLowerCase();
    return cleaned.length > 1 && !ignoreKeywords.includes(cleaned);
  });
};

// POST /api/bookings (Public - Customer Booking Flow)
export const createBooking = async (req, res) => {
  try {
    const {
      packageId,
      packageName,
      travelDate,
      friendlyTravelDate,
      totalPersons,
      sharingType,
      primaryContact,
      travelers,
      pricing,
      paymentOption,
    } = req.body;

    // Validation
    if (!packageName || !travelDate || !totalPersons || !primaryContact?.name || !primaryContact?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields. Please provide package, date, and traveler contact.',
      });
    }

    if (!Array.isArray(travelers) || travelers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one traveler must be provided.',
      });
    }

    // Generate unique collision-free booking reference
    let bookingRef = generateBookingRef();
    let existing = await Booking.findOne({ bookingRef });
    while (existing) {
      bookingRef = generateBookingRef();
      existing = await Booking.findOne({ bookingRef });
    }

    // Calculate financials
    const pricePerPerson = Number(pricing?.pricePerPerson) || 8999;
    const personsCount = Number(totalPersons) || travelers.length;
    const subtotal = Number(pricing?.subtotal) || pricePerPerson * personsCount;
    const discountAmount = Number(pricing?.discountAmount) || 0;
    const couponCode = pricing?.couponCode || '';
    const totalPayable = Math.max(0, subtotal - discountAmount);

    const advancePerPerson = 2000;
    const advanceAmount = advancePerPerson * personsCount;
    const chosenOption = paymentOption === 'full' ? 'full' : 'advance';
    const amountPaidNow = chosenOption === 'full' ? totalPayable : advanceAmount;
    const remainingBalance = Math.max(0, totalPayable - amountPaidNow);

    const hasMedicalAlert = detectMedicalAlert(travelers);

    // Create the booking document
    const newBooking = new Booking({
      bookingRef,
      packageId: packageId || 'custom-tour',
      packageName,
      travelDate,
      friendlyTravelDate: friendlyTravelDate || travelDate,
      totalPersons: personsCount,
      sharingType: sharingType || 'Standard Sharing',
      primaryContact: {
        name: primaryContact.name.trim(),
        email: primaryContact.email ? primaryContact.email.trim() : '',
        phone: primaryContact.phone.trim(),
        gender: primaryContact.gender || '',
        age: primaryContact.age ? Number(primaryContact.age) : null,
      },
      travelers: travelers.map((t, idx) => ({
        id: t.id || idx + 1,
        name: t.name ? t.name.trim() : `Traveler ${idx + 1}`,
        email: t.email ? t.email.trim() : '',
        gender: t.gender || '',
        age: t.age ? Number(t.age) : null,
        phone: t.phone ? t.phone.trim() : '',
        medical: t.medical ? t.medical.trim() : '',
      })),
      pricing: {
        pricePerPerson,
        subtotal,
        couponCode,
        discountAmount,
        totalPayable,
        advanceAmount,
        remainingBalance,
        paymentOption: chosenOption,
        amountPaidNow,
      },
      bookingStatus: 'confirmed',
      paymentStatus: 'advance_paid',
      paymentMethod:
        chosenOption === 'full'
          ? 'Full Package Payment (Gateway Ready)'
          : `Advance Deposit of ₹${advanceAmount.toLocaleString('en-IN')} (Balance ₹${remainingBalance.toLocaleString('en-IN')} at Basecamp)`,
      hasMedicalAlert,
    });

    await newBooking.save();

    // Also mirror into Lead collection for backwards compatibility & inquiries log
    try {
      await Lead.create({
        name: primaryContact.name,
        email: primaryContact.email || 'guest@weekendescapes.com',
        phone: primaryContact.phone,
        company: `${personsCount} Traveler(s) [${bookingRef}]`,
        subject: `Tour Booking: ${packageName} (Ref: ${bookingRef})`,
        message: `Booking Ref: ${bookingRef}\nPackage: ${packageName}\nTravel Date: ${friendlyTravelDate || travelDate}\nTotal Persons: ${personsCount}\nPayment Choice: ${chosenOption.toUpperCase()}\nPaid Now: ₹${amountPaidNow}\nBalance Due: ₹${remainingBalance}\nMedical Alert: ${hasMedicalAlert ? 'YES' : 'No'}`,
        source: 'package_booking',
      });
    } catch (leadErr) {
      console.warn('[createBooking] Could not mirror to Leads collection:', leadErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error('[createBooking Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message,
    });
  }
};

// GET /api/bookings (Protected Admin - List with filters & stats)
export const getBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50, medicalOnly } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (medicalOnly === 'true') {
      query.hasMedicalAlert = true;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { bookingRef: searchRegex },
        { packageName: searchRegex },
        { 'primaryContact.name': searchRegex },
        { 'primaryContact.phone': searchRegex },
        { 'primaryContact.email': searchRegex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, totalCount] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    // Aggregate overall metrics for top summary cards
    const [allCount, confirmedCount, pendingCount, completedCount, cancelledCount, medicalCount, revenueAgg] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ bookingStatus: 'confirmed' }),
        Booking.countDocuments({ bookingStatus: 'pending' }),
        Booking.countDocuments({ bookingStatus: 'completed' }),
        Booking.countDocuments({ bookingStatus: 'cancelled' }),
        Booking.countDocuments({ hasMedicalAlert: true }),
        Booking.aggregate([
          { $match: { bookingStatus: { $ne: 'cancelled' } } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$pricing.totalPayable' },
              totalCollected: { $sum: '$pricing.amountPaidNow' },
              totalDue: { $sum: '$pricing.remainingBalance' },
              totalPersons: { $sum: '$totalPersons' },
            },
          },
        ]),
      ]);

    const stats = {
      total: allCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      completed: completedCount,
      cancelled: cancelledCount,
      medicalAlerts: medicalCount,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      totalCollected: revenueAgg[0]?.totalCollected || 0,
      totalDue: revenueAgg[0]?.totalDue || 0,
      totalTravelers: revenueAgg[0]?.totalPersons || 0,
    };

    res.status(200).json({
      success: true,
      bookings,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit)) || 1,
      },
    });
  } catch (error) {
    console.error('[getBookings Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings',
      error: error.message,
    });
  }
};

// GET /api/bookings/:id (Protected Admin - Single Booking Details)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('[getBookingById Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking details',
      error: error.message,
    });
  }
};

// PUT /api/bookings/:id/status (Protected Admin - Update Status & Notes)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus, adminNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (bookingStatus !== undefined) booking.bookingStatus = bookingStatus;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('[updateBookingStatus Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message,
    });
  }
};

// DELETE /api/bookings/:id (Protected Admin - Remove Booking)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
      id,
    });
  } catch (error) {
    console.error('[deleteBooking Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message,
    });
  }
};
