import mongoose from 'mongoose';

const travelerSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: '' },
    gender: { type: String, default: '' },
    age: { type: Number, default: null },
    phone: { type: String, trim: true, default: '' },
    medical: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    packageId: {
      type: String,
      required: true,
      trim: true,
    },
    packageName: {
      type: String,
      required: true,
      trim: true,
    },
    travelDate: {
      type: String,
      required: true,
    },
    friendlyTravelDate: {
      type: String,
      default: '',
    },
    totalPersons: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
      default: 1,
    },
    sharingType: {
      type: String,
      default: 'Standard Sharing',
    },

    // Primary Contact (Traveler 1)
    primaryContact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      gender: { type: String, default: '' },
      age: { type: Number, default: null },
    },

    // All Travelers List
    travelers: {
      type: [travelerSchema],
      default: [],
    },

    // Financial & Pricing Ledger
    pricing: {
      pricePerPerson: { type: Number, required: true, default: 0 },
      subtotal: { type: Number, required: true, default: 0 },
      couponCode: { type: String, trim: true, default: '' },
      discountAmount: { type: Number, default: 0 },
      totalPayable: { type: Number, required: true, default: 0 },
      advanceAmount: { type: Number, default: 0 },
      remainingBalance: { type: Number, default: 0 },
      paymentOption: {
        type: String,
        enum: ['advance', 'full'],
        default: 'advance',
      },
      amountPaidNow: { type: Number, default: 0 },
    },

    // Booking Lifecycle & Status
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'advance_paid', 'paid', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'PhonePe Standard Checkout',
    },
    merchantOrderId: {
      type: String,
      default: '',
      index: true,
      trim: true,
    },
    phonepeOrderId: {
      type: String,
      default: '',
      trim: true,
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },

    // Medical Alert Indicator (True if any traveler notes medical conditions)
    hasMedicalAlert: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Internal Admin Notes
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching in Admin
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'primaryContact.name': 'text', 'primaryContact.phone': 'text', bookingRef: 'text' });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
