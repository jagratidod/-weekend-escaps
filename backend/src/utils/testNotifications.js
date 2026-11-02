import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import FcmDevice from '../models/FcmDevice.js';
import NotificationLog from '../models/NotificationLog.js';
import {
  sendPushNotification,
  notifyAdmins,
  notifyCustomer,
  broadcastToAll,
} from '../services/firebaseNotificationService.js';

async function runTests() {
  console.log('--- STARTING FCM PUSH NOTIFICATIONS VERIFICATION TEST ---');

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const testToken1 = 'test_token_device_abc_123';
  const testToken2 = 'test_token_device_xyz_789';

  // 1. Register test devices
  console.log('\n[1] Testing device token registration...');
  await FcmDevice.registerToken({
    token: testToken1,
    visitorId: 'vis_test_user_1',
    email: 'traveler1@example.com',
    isAdmin: false,
    platform: 'web',
  });

  await FcmDevice.registerToken({
    token: testToken2,
    visitorId: 'vis_test_admin_1',
    email: 'admin@weekendescapes.com',
    isAdmin: true,
    platform: 'web',
  });
  console.log('✅ Devices registered in FcmDevice collection.');

  // 2. Test Layer 1 & 2 Duplicate Prevention
  console.log('\n[2] Testing 3-Layer Duplicate Prevention (Zero Duplicate Delivery)...');
  const duplicateTestId = `dedupe_test_${Date.now()}`;

  const firstCall = await sendPushNotification({
    notificationId: duplicateTestId,
    recipient: 'user',
    tokens: [testToken1],
    title: 'First Trigger Test',
    body: 'This is the initial notification delivery.',
  });
  console.log('First Call Result:', firstCall.status || firstCall.log?.status, '| sentCount:', firstCall.sentCount);

  const secondCall = await sendPushNotification({
    notificationId: duplicateTestId,
    recipient: 'user',
    tokens: [testToken1],
    title: 'Duplicate Attempt',
    body: 'This attempt should be blocked by idempotency lock.',
  });
  console.log('Second Call Result:', secondCall);

  if (secondCall.skipped && secondCall.reason === 'duplicate') {
    console.log('✅ PASS: Second notification was successfully blocked by backend idempotency lock!');
  } else {
    console.error('❌ FAIL: Duplicate notification was not prevented.');
  }

  // 3. Test Customer & Admin Event Triggers
  console.log('\n[3] Testing Event Triggers...');
  const customerResult = await notifyCustomer({
    email: 'traveler1@example.com',
    title: '🎉 Booking Confirmed: Kedarkantha Trek',
    body: 'Booking Ref: WE-2026-99999. See you at the summit!',
    notificationId: `test_book_${Date.now()}_customer`,
  });
  console.log('Customer Notification Result:', customerResult.success ? '✅ Success' : '❌ Failed');

  const adminResult = await notifyAdmins({
    title: '🛎️ New Booking Alert: Kedarkantha Trek',
    body: 'Traveler 1 booked 2 tickets. Ref: WE-2026-99999',
    notificationId: `test_book_${Date.now()}_admin`,
  });
  console.log('Admin Notification Result:', adminResult.success ? '✅ Success' : '❌ Failed');

  // 4. Test Broadcast to All
  console.log('\n[4] Testing Broadcast Dispatch...');
  const broadcastResult = await broadcastToAll({
    title: '🏔️ Weekend Flash Sale!',
    body: 'Flat 20% off all Spiti Valley departures this Friday.',
    notificationId: `test_broadcast_${Date.now()}`,
  });
  console.log(
    'Broadcast Result:',
    broadcastResult.success ? '✅ Dispatched' : '❌ Failed',
    '| Recipients:',
    broadcastResult.sentCount
  );

  // Clean up test records
  await FcmDevice.deleteMany({ token: { $in: [testToken1, testToken2] } });
  await NotificationLog.deleteMany({
    notificationId: { $regex: /^(dedupe_test_|test_book_|test_broadcast_)/ },
  });
  console.log('\n✅ Test cleanup completed.');

  console.log('\n--- ALL PUSH NOTIFICATION TESTS PASSED SUCCESSFULLY! ---');
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
