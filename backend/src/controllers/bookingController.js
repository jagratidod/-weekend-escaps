import Package from '../models/Package.js';
import Booking from '../models/Booking.js';
import Lead from '../models/Lead.js';
import Coupon from '../models/Coupon.js';
import { notifyAdmins, notifyCustomer } from '../services/firebaseNotificationService.js';
import { sendOfflineRegistrationEmail } from '../services/emailService.js';

// Helper to generate a unique human-friendly booking reference
const generateBookingRef = (prefix = 'TRK') => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${randomPart}`;
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
      departureCity,
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
    const baseAfterDiscount = Math.max(0, subtotal - discountAmount);
    const gstRate = Number(pricing?.gstRate) >= 0 ? Number(pricing?.gstRate) : 5;
    const gstAmount = Number(pricing?.gstAmount) >= 0 ? Number(pricing?.gstAmount) : Number(((baseAfterDiscount * gstRate) / 100).toFixed(2));
    const totalPayable = Number((baseAfterDiscount + gstAmount).toFixed(2));

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
      departureCity: departureCity || 'Ahmedabad',
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
        gstRate,
        gstAmount,
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

    // Increment coupon used count if valid coupon applied
    if (couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: couponCode.trim().toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponErr) {
        console.warn('[createBooking - Online] Could not increment coupon usedCount:', couponErr.message);
      }
    }

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

    // Trigger Duplicate-Safe FCM Push Notifications (Customer + Admins)
    const visitorId = req.body.visitorId || null;
    notifyCustomer({
      email: primaryContact.email,
      visitorId,
      title: '🎉 Booking Confirmed!',
      body: `Your expedition to ${packageName} is confirmed (Ref: ${bookingRef}). Travel date: ${friendlyTravelDate || travelDate}.`,
      data: {
        type: 'booking',
        id: bookingRef,
        link: '/destinations',
      },
      notificationId: `booking_${bookingRef}_customer`,
    }).catch((fcmErr) => console.error('[FCM Customer Booking Push Error]:', fcmErr.message));

    notifyAdmins({
      title: '🛎️ New Tour Booking Alert!',
      body: `${primaryContact.name} booked ${packageName} (${personsCount} travelers) - Ref: ${bookingRef}`,
      data: {
        type: 'admin_booking',
        id: bookingRef,
        link: '/admin',
      },
      notificationId: `booking_${bookingRef}_admin`,
    }).catch((fcmErr) => console.error('[FCM Admin Booking Push Error]:', fcmErr.message));

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
    const { bookingStatus, paymentStatus, tripStatus, adminNotes, amountPaid } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (bookingStatus !== undefined) booking.bookingStatus = bookingStatus;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (tripStatus !== undefined) booking.tripStatus = tripStatus;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    if (amountPaid !== undefined) {
      const amt = Number(amountPaid);
      if (!isNaN(amt)) {
        if (!booking.pricing) booking.pricing = {};
        if (!booking.paymentDetails) booking.paymentDetails = {};
        booking.pricing.amountPaidNow = amt;
        booking.paymentDetails.amountPaid = amt;
        const total = Number(booking.pricing.totalPayable) || 0;
        booking.pricing.remainingBalance = Math.max(0, total - amt);
        if (total > 0 && amt >= total) {
          booking.paymentStatus = 'paid';
        } else if (amt > 0) {
          booking.paymentStatus = 'advance_paid';
        }
      }
    }

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

// POST /api/bookings/offline-register (Public - Dedicated Offline Registration Flow)
export const createOfflineRegistration = async (req, res) => {
  try {
    const {
      tripName,
      packageId,
      travelDate,
      friendlyTravelDate,
      bookingType = 'group',
      totalPersons = 1,
      primaryContact,
      travelers = [],
      emergencyContact,
      payment,
    } = req.body;

    // Strict validation
    if (!tripName || !travelDate) {
      return res.status(400).json({
        success: false,
        message: 'Trip name and departure date are required.',
      });
    }

    if (!primaryContact?.name || !primaryContact?.email || !primaryContact?.phone) {
      return res.status(400).json({
        success: false,
        message: 'Primary traveler name, email, and phone number are required.',
      });
    }

    if (!payment?.utrNumber) {
      return res.status(400).json({
        success: false,
        message: 'Payment UTR or transaction reference number is required.',
      });
    }

    const companyName = process.env.COMPANY_NAME || 'Treki Travels';
    const prefix = companyName.toLowerCase().includes('treki') ? 'TRK' : 'WE';

    // Generate unique collision-free booking reference
    let bookingRef = generateBookingRef(prefix);
    let existing = await Booking.findOne({ bookingRef });
    while (existing) {
      bookingRef = generateBookingRef(prefix);
      existing = await Booking.findOne({ bookingRef });
    }

    const personsCount = Math.max(1, Number(totalPersons) || (travelers.length > 0 ? travelers.length : 1));
    const amountPaid = Number(payment.amountPaid) || 0;

    // Detect medical alerts
    const hasTravelerMedical = detectMedicalAlert(travelers);
    const hasEmergencyHealth = Boolean(emergencyContact?.healthInfo && emergencyContact.healthInfo.trim().length > 2);
    const hasMedicalAlert = hasTravelerMedical || hasEmergencyHealth;

    // Build travelers array ensuring Traveler 1 is included
    const allTravelers = (Array.isArray(travelers) && travelers.length > 0)
      ? travelers
      : [
          {
            id: 1,
            name: primaryContact.name.trim(),
            email: primaryContact.email.trim(),
            phone: primaryContact.phone.trim(),
            gender: primaryContact.gender || '',
            age: primaryContact.age ? Number(primaryContact.age) : null,
            medical: emergencyContact?.healthInfo || '',
          },
        ];

    // Create Booking model
    const newBooking = new Booking({
      bookingRef,
      packageId: packageId || 'offline-custom',
      packageName: tripName.trim(),
      travelDate,
      departureCity: departureCity || 'Ahmedabad',
      friendlyTravelDate: friendlyTravelDate || travelDate,
      totalPersons: personsCount,
      sharingType: bookingType === 'solo' ? 'Solo Traveler' : 'Group Booking',
      bookingType: bookingType === 'solo' ? 'solo' : 'group',
      bookingSource: 'offline_registration',

      primaryContact: {
        name: primaryContact.name.trim(),
        email: primaryContact.email.trim(),
        phone: primaryContact.phone.trim(),
        gender: primaryContact.gender || '',
        age: primaryContact.age ? Number(primaryContact.age) : null,
      },

      travelers: allTravelers.map((t, idx) => ({
        id: t.id || idx + 1,
        name: t.name ? t.name.trim() : `Traveler ${idx + 1}`,
        email: t.email ? t.email.trim() : (idx === 0 ? primaryContact.email.trim() : ''),
        gender: t.gender || '',
        age: t.age ? Number(t.age) : null,
        phone: t.phone ? t.phone.trim() : (idx === 0 ? primaryContact.phone.trim() : ''),
        medical: t.medical ? t.medical.trim() : (idx === 0 ? (emergencyContact?.healthInfo || '') : ''),
      })),

      emergencyContact: {
        name: emergencyContact?.name ? emergencyContact.name.trim() : '',
        phone: emergencyContact?.phone ? emergencyContact.phone.trim() : '',
        relationship: emergencyContact?.relationship || 'Parent',
        healthInfo: emergencyContact?.healthInfo ? emergencyContact.healthInfo.trim() : '',
      },

      pricing: {
        pricePerPerson: amountPaid > 0 && personsCount > 0 ? Math.round(amountPaid / personsCount) : 0,
        subtotal: amountPaid,
        couponCode: '',
        discountAmount: 0,
        totalPayable: amountPaid,
        advanceAmount: amountPaid,
        remainingBalance: 0,
        paymentOption: 'advance',
        amountPaidNow: amountPaid,
      },

      paymentDetails: {
        utrNumber: payment.utrNumber.trim(),
        paymentMethod: payment.paymentMethod || 'UPI',
        amountPaid,
        remarks: payment.remarks ? payment.remarks.trim() : '',
      },

      paymentMethod: `Offline (${payment.paymentMethod || 'UPI'}) - UTR: ${payment.utrNumber.trim()}`,
      bookingStatus: 'confirmed',
      paymentStatus: 'advance_paid',
      paymentVerifiedAt: new Date(),
      hasMedicalAlert,
      adminNotes: `Registered via /registration. UTR: ${payment.utrNumber.trim()}${payment.remarks ? ` | Remarks: ${payment.remarks.trim()}` : ''}`,
    });

    await newBooking.save();

    // Increment coupon used count if valid coupon applied
    if (couponCode) {
      try {
        await Coupon.findOneAndUpdate(
          { code: couponCode.trim().toUpperCase() },
          { $inc: { usedCount: 1 } }
        );
      } catch (couponErr) {
        console.warn('[createBooking - Online] Could not increment coupon usedCount:', couponErr.message);
      }
    }

    // Mirror to Leads collection for CRM visibility
    try {
      await Lead.create({
        name: primaryContact.name.trim(),
        email: primaryContact.email.trim(),
        phone: primaryContact.phone.trim(),
        company: `${personsCount} Traveler(s) [Offline: ${bookingRef}]`,
        subject: `Offline Registration: ${tripName} (Ref: ${bookingRef})`,
        message: `Booking Ref: ${bookingRef}\nTrip: ${tripName}\nDate: ${friendlyTravelDate || travelDate}\nTravelers: ${personsCount}\nUTR / Ref: ${payment.utrNumber}\nAmount Paid: ₹${amountPaid}\nPayment Method: ${payment.paymentMethod || 'UPI'}\nEmergency Contact: ${emergencyContact?.name || 'N/A'} (${emergencyContact?.phone || 'N/A'})\nMedical Notes: ${emergencyContact?.healthInfo || 'None'}`,
        source: 'offline_registration',
      });
    } catch (leadErr) {
      console.warn('[createOfflineRegistration] Lead mirror warning:', leadErr.message);
    }

    // Send the requested confirmation email via Gmail/SMTP (or simulation fallback)
    const emailResult = await sendOfflineRegistrationEmail(newBooking);

    // Push notification to Admin dashboard
    try {
      await notifyAdmins({
        title: '📋 New Offline Registration!',
        body: `${primaryContact.name} submitted registration for ${tripName} (${personsCount} Travelers). UTR: ${payment.utrNumber}`,
        data: {
          type: 'admin_booking',
          id: bookingRef,
          link: '/admin',
        },
        notificationId: `offline_reg_${bookingRef}`,
      });
    } catch (notifErr) {
      console.warn('[createOfflineRegistration] Push notification warning:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully! Confirmation email dispatched.',
      bookingRef,
      booking: newBooking,
      emailStatus: emailResult,
    });
  } catch (error) {
    console.error('[createOfflineRegistration Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process registration. Please try again.',
      error: error.message,
    });
  }
};


// Helper to parse multiple date formats (YYYY-MM-DD, DD Mon YYYY, etc.)
const parseTravelDate = (dateStr) => {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  return new Date();
};

// Helper to format date into friendly e.g. "21 Nov 2026"
const formatFriendlyDate = (dateObj) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

// Helper to calculate stage and itinerary
export const calculateTripProgress = (booking, packageData = null) => {
  const travelDateObj = parseTravelDate(booking.travelDate);
  const now = new Date();
  
  // Set to midnight for date-based comparisons
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayZero = startOfDay(now);
  const travelDateZero = startOfDay(travelDateObj);

  // Determine duration
  let durationDays = 5;
  const rawItinerary = packageData?.itinerary || [];
  if (rawItinerary.length > 0) {
    durationDays = rawItinerary.length;
  } else if (packageData?.duration) {
    const match = packageData.duration.match(/(\d+)\s*Days?/i);
    if (match) durationDays = parseInt(match[1], 10);
  }

  // End of trip
  const endDateZero = new Date(travelDateZero);
  endDateZero.setDate(endDateZero.getDate() + (durationDays - 1));

  // Determine stage (1: BOOKED, 2: DEPARTURE, 3: EXPLORING, 4: COMPLETED / EXPLORED)
  let stageKey = 'BOOKED';
  let step = 1;

  if (booking.tripStatus && booking.tripStatus !== 'AUTO') {
    stageKey = booking.tripStatus;
    if (stageKey === 'BOOKED') step = 1;
    else if (stageKey === 'DEPARTURE') step = 2;
    else if (stageKey === 'EXPLORING') step = 3;
    else if (stageKey === 'COMPLETED' || stageKey === 'EXPLORED') step = 4;
  } else {
    // Automated based on live date
    if (todayZero < travelDateZero) {
      stageKey = 'BOOKED';
      step = 1;
    } else if (todayZero.getTime() === travelDateZero.getTime()) {
      stageKey = 'DEPARTURE';
      step = 2;
    } else if (todayZero > travelDateZero && todayZero <= endDateZero) {
      stageKey = 'EXPLORING';
      step = 3;
    } else if (todayZero > endDateZero) {
      stageKey = 'COMPLETED';
      step = 4;
    }
  }

  // Generate dated itinerary
  const fallbackItinerary = [
    { day: 'Day 0', title: 'Reporting & Departure', desc: 'Meet your trip captain and assemble at the boarding point. Journey begins towards basecamp.' },
    { day: 'Day 1', title: 'Basecamp Arrival & Acclimatization', desc: 'Reach basecamp, settle in campsites and participate in the orientation & gear check session.' },
    { day: 'Day 2', title: 'Trek to Juda Ka Talab / High Campsite', desc: 'Trek through pine forests and snowy meadows. Camp by the scenic alpine lake.' },
    { day: 'Day 3', title: 'Summit Ascent & Ridge Walk', desc: 'Early morning summit push to witness breathtaking 360-degree Himalayan sunrise views.' },
    { day: 'Day 4', title: 'Descent & Farewell Celebration', desc: 'Descend back with unforgettable memories and certificate distribution.' }
  ];

  const sourceItinerary = (rawItinerary.length > 0 ? rawItinerary : fallbackItinerary);

  const datedItinerary = sourceItinerary.map((item, idx) => {
    const itemDate = new Date(travelDateZero);
    itemDate.setDate(itemDate.getDate() + idx);
    const itemZero = startOfDay(itemDate);
    const isLiveToday = todayZero.getTime() === itemZero.getTime();
    const isPassed = todayZero > itemZero;

    return {
      dayIndex: idx,
      dayLabel: item.day || `Day ${idx}`,
      title: item.title,
      desc: item.desc,
      formattedDate: formatFriendlyDate(itemDate),
      isLiveToday,
      isPassed,
    };
  });

  return {
    stageKey,
    stageLabel: stageKey === 'COMPLETED' ? 'EXPLORED' : stageKey,
    step, // 1 to 4
    durationDays,
    startDateFormatted: formatFriendlyDate(travelDateZero),
    endDateFormatted: formatFriendlyDate(endDateZero),
    datedItinerary,
  };
};

// GET /api/bookings/my-bookings (Public - Find customer bookings by 10-digit mobile)
export const getMyBookingsByPhone = async (req, res) => {
  try {
    const rawPhone = req.query.phone || req.body?.phone || '';
    const cleanDigits = String(rawPhone).replace(/\D/g, '');
    const last10 = cleanDigits.slice(-10);

    if (!last10 || last10.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.',
      });
    }

    // Search in primaryContact.phone OR travelers.phone
    const phoneRegex = new RegExp(last10, 'i');
    const bookings = await Booking.find({
      $or: [
        { 'primaryContact.phone': phoneRegex },
        { 'travelers.phone': phoneRegex },
      ],
    }).sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        customerName: '',
        bookings: [],
        upcoming: [],
        ongoing: [],
        past: [],
      });
    }

    // Fetch associated packages for itineraries
    const packageIds = [...new Set(bookings.map((b) => b.packageId).filter(Boolean))];
    const packagesList = await Package.find({
      $or: [
        { id: { $in: packageIds } },
        { _id: { $in: packageIds.filter((id) => id && id.match(/^[0-9a-fA-F]{24}$/)) } }
      ],
    });

    const packageMap = new Map();
    packagesList.forEach((pkg) => {
      if (pkg.id) packageMap.set(pkg.id, pkg);
      packageMap.set(String(pkg._id), pkg);
      if (pkg.name) packageMap.set(pkg.name.toLowerCase().trim(), pkg);
    });

    // Customer name from first/latest booking
    const customerName = bookings[0].primaryContact?.name || bookings[0].travelers?.[0]?.name || 'Traveler';

    // Enrich each booking with live progress, financial ledger & dated itinerary
    const enriched = bookings.map((booking) => {
      const bObj = booking.toObject();
      const pkg = packageMap.get(booking.packageId) || packageMap.get(booking.packageName?.toLowerCase().trim());
      const progress = calculateTripProgress(bObj, pkg);

      const advancePaid = Number(bObj.pricing?.amountPaidNow) || Number(bObj.paymentDetails?.amountPaid) || Number(bObj.pricing?.advanceAmount) || 0;
      const totalPayable = Number(bObj.pricing?.totalPayable) || Number(bObj.pricing?.subtotal) || 0;
      const balanceDue = Math.max(0, totalPayable - advancePaid);
      const isFullPaid = bObj.paymentStatus === 'paid' || (totalPayable > 0 && advancePaid >= totalPayable);

      return {
        ...bObj,
        progress,
        financials: {
          totalAdvancePaid: advancePaid,
          totalPayable,
          balanceDue,
          isFullPaid,
          statusLabel: isFullPaid ? 'PAID' : advancePaid > 0 ? 'ADVANCE PAID' : 'PENDING',
        },
      };
    });

    // Categorize
    const upcoming = enriched.filter((b) => b.progress.step === 1 && b.bookingStatus !== 'cancelled');
    const ongoing = enriched.filter((b) => (b.progress.step === 2 || b.progress.step === 3) && b.bookingStatus !== 'cancelled');
    const past = enriched.filter((b) => b.progress.step === 4 || b.bookingStatus === 'cancelled');

    res.status(200).json({
      success: true,
      count: enriched.length,
      customerName,
      bookings: enriched,
      upcoming,
      ongoing,
      past,
    });
  } catch (error) {
    console.error('[getMyBookingsByPhone Error]:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your bookings.',
      error: error.message,
    });
  }
};
