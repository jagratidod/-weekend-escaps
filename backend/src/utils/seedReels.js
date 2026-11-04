import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Reel from '../models/Reel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SEED_REELS = [
  {
    author: 'Xplorer Anil',
    trek: 'KEDARKANTHA TREK',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457945/weekend_escapes/exploresection/kedarkantha.png',
    fileSize: 4500000,
    isActive: true,
    order: 1,
  },
  {
    author: 'Jove Singh',
    trek: 'KEDARKANTHA TREK',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457948/weekend_escapes/about/kedarkantha.png',
    fileSize: 5200000,
    isActive: true,
    order: 2,
  },
  {
    author: 'Anil Yogi',
    trek: 'KEDARKANTHA TREK',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457951/weekend_escapes/exploresection/manali.png',
    fileSize: 4800000,
    isActive: true,
    order: 3,
  },
  {
    author: 'Adarsh Tiwari',
    trek: 'KEDARKANTHA TREK',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457945/weekend_escapes/about/image1.png',
    fileSize: 4900000,
    isActive: true,
    order: 4,
  },
  {
    author: 'Priya Sharma',
    trek: 'KEDARKANTHA TREK',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457948/weekend_escapes/about/kashmir.png',
    fileSize: 4600000,
    isActive: true,
    order: 5,
  },
  {
    author: 'Vikram Singhania',
    trek: 'SPITI VALLEY EXPEDITION',
    video: 'https://res.cloudinary.com/lypvsp0h/video/upload/v1793723000/weekend_escapes/reels/trip-reel-1.mp4',
    poster: 'https://res.cloudinary.com/lypvsp0h/image/upload/v1793457951/weekend_escapes/about/vally.png',
    fileSize: 5800000,
    isActive: true,
    order: 6,
  },
];

export const seedReels = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[Seed Reels] MONGODB_URI not found in .env');
      return;
    }

    await mongoose.connect(mongoUri);
    console.log('[Seed Reels] Connected to MongoDB.');

    const count = await Reel.countDocuments();
    if (count > 0) {
      console.log(`[Seed Reels] Already found ${count} reels. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    await Reel.insertMany(SEED_REELS);
    console.log(`[Seed Reels] Successfully seeded ${SEED_REELS.length} travel reels.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('[Seed Reels Error]', error.message);
  }
};

if (process.argv[1] && process.argv[1].endsWith('seedReels.js')) {
  seedReels();
}
