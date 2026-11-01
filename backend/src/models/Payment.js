import mongoose from 'mongoose';

const refundDetailSchema = new mongoose.Schema(
  {
    merchantRefundId: { type: String, required: true },
    phonePeRefundId: { type: String, default: '' },
    amount: { type: Number, required: true }, // In INR Rupees
    amountInPaise: { type: Number, required: true }, // In Paise
    reason: { type: String, default: 'Customer cancellation / admin refund' },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    bookingRef: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    merchantOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    phonePeOrderId: {
      type: String,
      default: '',
      trim: true,
    },
    phonePeTransactionId: {
      type: String,
      default: '',
      trim: true,
    },
    paymentGateway: {
      type: String,
      default: 'PHONEPE',
    },
    paymentType: {
      type: String,
      enum: ['FULL', 'ADVANCE', 'REMAINING'],
      default: 'FULL',
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // In INR Rupees
    },
    amountInPaise: {
      type: Number,
      required: true,
      min: 100, // In integer paise
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentRail: {
      type: String,
      default: '', // UPI, CREDIT_CARD, DEBIT_CARD, NET_BANKING
    },
    customer: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    errorCode: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    refundDetails: {
      type: [refundDetailSchema],
      default: [],
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
