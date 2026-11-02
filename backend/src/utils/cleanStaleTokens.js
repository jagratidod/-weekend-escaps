import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import FcmDevice from '../models/FcmDevice.js';
import Admin from '../models/Admin.js';

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await FcmDevice.deleteMany({});
  console.log('Cleared stale FcmDevices:', res.deletedCount);

  const adminRes = await Admin.updateMany({}, { $set: { fcmTokens: [], fcmTokenMobile: [] } });
  console.log('Cleared stale Admin tokens:', adminRes.modifiedCount);

  await mongoose.disconnect();
}

clean().catch(console.error);
