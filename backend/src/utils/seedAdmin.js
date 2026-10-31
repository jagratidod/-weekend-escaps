import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Setting from '../models/Setting.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB Atlas');

    // 1. Check or Create Default Admin
    const adminEmail = 'admin@weekendescapes.com';
    const adminPassword = 'Admin@12345';

    let admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      admin = await Admin.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
      });
      console.log(`[Seed] ✅ Default Admin created successfully!`);
      console.log(`       Email: ${adminEmail}`);
      console.log(`       Password: ${adminPassword}`);
    } else {
      console.log(`[Seed] ℹ️ Admin with email ${adminEmail} already exists.`);
    }

    // 2. Check or Create Default Site Settings (Logo)
    let settings = await Setting.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = await Setting.create({
        key: 'site_settings',
        logoUrl: '/logo/weekend-escapes-logo.svg',
        siteName: 'Weekend Escapes',
        tagline: 'Crafting Adventures',
        updatedBy: admin._id,
      });
      console.log(`[Seed] ✅ Default Site Settings & Logo initialized!`);
    } else {
      console.log(`[Seed] ℹ️ Site settings already initialized.`);
    }

    await mongoose.disconnect();
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error.message);
    process.exit(1);
  }
};

seedDatabase();
