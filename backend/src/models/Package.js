import mongoose from 'mongoose';

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // e.g. "Day 1"
    title: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const batchSchema = new mongoose.Schema(
  {
    startDate: { type: String, required: true }, // "YYYY-MM-DD"
    endDate: { type: String, default: '' }, // "YYYY-MM-DD"
    totalSeats: { type: Number, default: 16, min: 1 },
    bookedSeats: { type: Number, default: 0, min: 0 },
    priceOverride: { type: Number, default: null },
    status: {
      type: String,
      enum: ['auto', 'available', 'filling_fast', 'sold_out'],
      default: 'auto',
    },
    note: { type: String, default: '', trim: true }, // e.g. "Weekend Special", "Long Weekend Batch"
  },
  { _id: true }
);

const blackoutDateSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    reason: { type: String, default: 'Operational closure / Maintenance', trim: true },
  },
  { _id: false }
);

const pricingTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Quad Sharing" or "Manali to Manali"
    subtext: { type: String, default: '', trim: true }, // e.g. "Camp in Kedarnath" or "Reporting at Basecamp"
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    scheduleType: {
      type: String,
      enum: ['daily', 'weekends', 'batches', 'custom'],
      default: 'daily',
    },
    defaultSeatsPerBatch: {
      type: Number,
      default: 16,
      min: 1,
    },
    minAdvanceNoticeDays: {
      type: Number,
      default: 1,
      min: 0,
    },
    batches: {
      type: [batchSchema],
      default: [],
    },
    blackoutDates: {
      type: [blackoutDateSchema],
      default: [],
    },
  },
  { _id: false }
);

const packageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
    },
    badge: {
      type: String,
      default: '',
      trim: true,
    },
    badgeColor: {
      type: String,
      default: 'bg-[#FF6B16] text-white',
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'], // e.g. "6 Days / 5 Nights"
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'], // e.g. "Uttarakhand, India"
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    pricingType: {
      type: String,
      enum: ['standard', 'sharing', 'distance', 'custom'],
      default: 'standard',
    },
    pricingTiers: {
      type: [pricingTierSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 150,
      min: 0,
    },
    image: {
      type: String,
      required: [true, 'Main image URL is required'],
      trim: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    travelType: {
      type: String,
      required: [true, 'Travel type is required'], // e.g. "Trekking", "Adventure", "Honeymoon & Leisure", "International"
      trim: true,
    },
    difficulty: {
      type: String,
      default: 'Easy to Moderate',
      trim: true,
    },
    season: {
      type: String,
      default: 'All Year Round',
      trim: true,
    },
    groupSize: {
      type: String,
      default: '12 - 18 Explorers',
      trim: true,
    },
    included: {
      type: [String],
      default: [],
    },
    excluded: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: [itineraryDaySchema],
      default: [],
    },
    availability: {
      type: availabilitySchema,
      default: () => ({
        scheduleType: 'daily',
        defaultSeatsPerBatch: 16,
        minAdvanceNoticeDays: 1,
        batches: [],
        blackoutDates: [],
      }),
    },
    highlights: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: true,
    },
    isPrivateTrek: {
      type: Boolean,
      default: false,
      index: true,
    },
    privateTrekNote: {
      type: String,
      default: 'Direct WhatsApp Booking • Custom Batches',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug `id` if not provided
packageSchema.pre('validate', function () {
  if (!this.id && this.name) {
    this.id = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
});

const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);

export default Package;
