import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Testimonial from '../models/Testimonial.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SEED_TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    trip: 'Kedarkantha Trek',
    location: 'Mumbai, India',
    image: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457945/weekend_escapes/testimonials/priya-sharma-card.png',
    rating: 5,
    quote: 'Kedarkantha with Weekend Escapes was an incredible experience. Everything was well-organized and the team was amazing.',
    badge: 'Solo Hiker',
    status: 'approved',
  },
  {
    name: 'Rahul Mehta',
    trip: 'Kashmir Package',
    location: 'Bangalore, India',
    image: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457948/weekend_escapes/testimonials/rahul-mehta-card.png',
    rating: 5,
    quote: 'Best travel company! Our Kashmir trip was magical. Highly recommended for their professional service.',
    badge: 'Couples Tour',
    status: 'approved',
  },
  {
    name: 'Sneha Patel',
    trip: 'Manali Trip',
    location: 'Delhi NCR, India',
    image: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457951/weekend_escapes/testimonials/sneha-patel-card.png',
    rating: 5,
    quote: "A perfect blend of adventure and comfort. Can't wait for my next trip with Weekend Escapes!",
    badge: 'Family Group',
    status: 'approved',
  },
  {
    name: 'Amit Roy',
    trip: 'Spiti Valley Expedition',
    location: 'Pune, India',
    image: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457948/weekend_escapes/testimonials/rahul-mehta-card.png',
    rating: 5,
    quote: 'The Spiti road trip was the adventure of a lifetime. The drivers and marshals took care of every twist and high altitude challenge!',
    badge: 'Road Tripper',
    status: 'approved',
  },
  {
    name: 'Kavita Menon',
    trip: 'Manali Adventure',
    location: 'Hyderabad, India',
    image: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457945/weekend_escapes/testimonials/priya-sharma-card.png',
    rating: 5,
    quote: 'River rafting, paragliding in Solang, and cozy bonfire nights in Old Manali. We made friends for life with our group batch!',
    badge: 'Adventure Enthusiast',
    status: 'approved',
  },
];

async function seedTestimonials() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment');
      process.exit(1);
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB Atlas');

    // Check existing
    const existingCount = await Testimonial.countDocuments();
    console.log(`[Seed] Current testimonials in DB: ${existingCount}`);

    if (existingCount === 0) {
      console.log('[Seed] Inserting initial verified testimonials...');
      await Testimonial.insertMany(SEED_TESTIMONIALS);
      console.log(`✅ Successfully seeded ${SEED_TESTIMONIALS.length} verified testimonials into database!`);
    } else {
      console.log('[Seed] Testimonials already present. Updating or verifying seeds...');
      for (const t of SEED_TESTIMONIALS) {
        const found = await Testimonial.findOne({ name: t.name, trip: t.trip });
        if (!found) {
          await Testimonial.create(t);
          console.log(`   + Added: ${t.name} (${t.trip})`);
        } else {
          // Update image to Cloudinary link
          found.image = t.image;
          found.status = 'approved';
          await found.save();
          console.log(`   * Verified: ${t.name} (${t.trip})`);
        }
      }
      console.log('✅ All verified testimonials synced with Cloudinary CDN URLs!');
    }

    const finalCount = await Testimonial.countDocuments();
    const approvedCount = await Testimonial.countDocuments({ status: 'approved' });
    const pendingCount = await Testimonial.countDocuments({ status: 'pending' });
    console.log(`\n📊 DB Status -> Total: ${finalCount} | Approved: ${approvedCount} | Pending: ${pendingCount}`);

    await mongoose.disconnect();
    console.log('[Seed] Disconnected from MongoDB. Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedTestimonials();
