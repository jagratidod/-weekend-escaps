import mongoose from 'mongoose';

/**
 * NotificationLog Model
 * Production-ready deduplication & idempotency log for FCM push notifications.
 *
 * Implements Layer 1 (Backend Idempotency Key) and Layer 2 (Unique DB Index)
 * with a 24-hour TTL index to automatically prune historical logs.
 */
const notificationLogSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: [true, 'Notification idempotency ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    recipient: {
      type: String,
      default: 'user',
      index: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    tokens: {
      type: [String],
      default: [],
    },
    title: {
      type: String,
      default: '',
    },
    body: {
      type: String,
      default: '',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'simulated'],
      default: 'sent',
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    clicksCount: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000, // 30 days retention for campaign analytics
    },
  },
  {
    timestamps: false,
  }
);

const NotificationLog = mongoose.models.NotificationLog || mongoose.model('NotificationLog', notificationLogSchema);

export default NotificationLog;
