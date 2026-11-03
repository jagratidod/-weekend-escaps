import mongoose from 'mongoose';

const packageCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Compass',
    },
    order: {
      type: Number,
      default: 0,
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

packageCategorySchema.index({ order: 1, name: 1 });

const PackageCategory = mongoose.model('PackageCategory', packageCategorySchema);

export default PackageCategory;
