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
