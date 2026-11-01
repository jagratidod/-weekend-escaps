import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => 'sec_' + Math.random().toString(36).substring(2, 9),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    items: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Terms & Conditions',
    },
    subtitle: {
      type: String,
      default: 'Please review our expedition guidelines, booking rules, and adventure travel policies.',
    },
    badge: {
      type: String,
      default: 'Legal & Policies',
    },
    headerBgColor: {
      type: String,
      default: '#F8F8F2',
    },
    headerTextColor: {
      type: String,
      default: '#1F2432',
    },
    showLastUpdated: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: String,
      default: 'March 22, 2026',
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Page = mongoose.model('Page', pageSchema);

export default Page;
