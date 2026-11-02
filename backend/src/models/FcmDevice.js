import mongoose from 'mongoose';

/**
 * FcmDevice Model
 * Stores FCM registration tokens for visitors, customers, and administrators across web and mobile.
 *
 * Supports multi-device delivery, automatic stale token removal,
 * and differentiation between admin alerts and broadcast recipients.
 */
const fcmDeviceSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'FCM registration token is required'],
      unique: true,
      index: true,
      trim: true,
    },
    visitorId: {
      type: String,
      index: true,
      default: null,
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
      index: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
    platform: {
      type: String,
      enum: ['web', 'android', 'ios'],
      default: 'web',
      index: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to update or register a token
fcmDeviceSchema.statics.registerToken = async function ({
  token,
  visitorId = null,
  userId = null,
  email = null,
  isAdmin = false,
  platform = 'web',
  userAgent = '',
}) {
  return await this.findOneAndUpdate(
    { token },
    {
      $set: {
        token,
        ...(visitorId ? { visitorId } : {}),
        ...(userId ? { userId } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        isAdmin: Boolean(isAdmin),
        platform: ['web', 'android', 'ios'].includes(platform) ? platform : 'web',
        userAgent,
        lastActive: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const FcmDevice = mongoose.models.FcmDevice || mongoose.model('FcmDevice', fcmDeviceSchema);

export default FcmDevice;
