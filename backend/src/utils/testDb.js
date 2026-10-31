import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';

console.log('Testing connection to MongoDB Atlas...');
console.log('URI:', (process.env.MONGODB_URI || '').replace(/:([^@]+)@/, ':****@'));

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  });

  console.log('====================================');
  console.log(' MongoDB Connection SUCCESSFUL!');
  console.log(' Host:', conn.connection.host);
  console.log(' Database:', conn.connection.name);
  console.log(' Port:', conn.connection.port);
  console.log(' ReadyState:', conn.connection.readyState);
  console.log('====================================');

  await mongoose.disconnect();
  console.log('Disconnected gracefully.');
  process.exit(0);
} catch (error) {
  console.error('====================================');
  console.error('❌ MongoDB Connection FAILED:');
  console.error(error.message);
  console.error('====================================');
  process.exit(1);
}
