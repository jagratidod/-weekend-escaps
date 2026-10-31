import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Traveler name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    trip: {
      type: String,
      required: [true, 'Trip/Package name is required'],
      trim: true,
      maxlength: [120, 'Trip name cannot exceed 120 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '/images/testimonials/priya-sharma-card.png',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
      default: 5,
    },
    quote: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    badge: {
      type: String,
      default: 'Adventurer',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // Requires admin approval before appearing on public UI
    },
  },
  {
    timestamps: true,
  }
);

testimonialSchema.index({ createdAt: -1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
