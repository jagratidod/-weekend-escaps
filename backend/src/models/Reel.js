import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: [true, 'Traveler or author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    trek: {
      type: String,
      required: [true, 'Trek or destination name is required'],
      trim: true,
      maxlength: [120, 'Trek name cannot exceed 120 characters'],
    },
    video: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    videoPublicId: {
      type: String,
      trim: true,
      default: null,
    },
    poster: {
      type: String,
      trim: true,
      default: '',
    },
    posterPublicId: {
      type: String,
      trim: true,
      default: null,
    },
    fileSize: {
      type: Number, // In bytes
      default: 0,
    },
    duration: {
      type: Number, // In seconds
      default: 0,
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

reelSchema.index({ isActive: 1, order: 1, createdAt: -1 });

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
