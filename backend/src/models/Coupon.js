import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [30, 'Coupon code cannot exceed 30 characters'],
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat', 'per_person'],
      required: true,
      default: 'flat',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, 'Max discount cannot be negative'],
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum booking amount cannot be negative'],
    },
    startDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: [1, 'Usage limit must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    // Target Audience: 'all' (public) vs 'specific_users' (exclusive to phone numbers)
    targetType: {
      type: String,
      enum: ['all', 'specific_users'],
      default: 'all',
      index: true,
    },
    assignedPhones: [
      {
        type: String,
        trim: true,
      },
    ],
    applicablePackages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful instance method to check validity and calculate discount
couponSchema.methods.calculateDiscount = function ({
  subtotal = 0,
  totalPersons = 1,
  packageId = null,
  phone = null,
}) {
  const now = new Date();

  if (!this.isActive) {
    return { valid: false, message: 'This coupon is currently inactive.' };
  }

  // Check phone number authorization if coupon is user-specific
  if (this.targetType === 'specific_users') {
    const rawDigits = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    if (!rawDigits || rawDigits.length < 10) {
      return {
        valid: false,
        message: 'This coupon is exclusive to assigned customers. Please provide your 10-digit mobile number.',
      };
    }

    const isMatch =
      Array.isArray(this.assignedPhones) &&
      this.assignedPhones.some((p) => {
        const assignedDigits = String(p).replace(/\D/g, '').slice(-10);
        return assignedDigits === rawDigits;
      });

    if (!isMatch) {
      return {
        valid: false,
        message: 'This exclusive coupon is assigned to a different customer phone number.',
      };
    }
  }

  if (this.startDate && new Date(this.startDate) > now) {
    return { valid: false, message: 'This coupon offer has not started yet.' };
  }

  if (this.expiryDate) {
    const exp = new Date(this.expiryDate);
    // If time is set to midnight (date-only entry), consider it valid through the end of that day
    if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0) {
      exp.setUTCHours(23, 59, 59, 999);
    }
    if (exp < now) {
      return { valid: false, message: 'This coupon has expired.' };
    }
  }

  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This coupon usage limit has been reached.' };
  }

  if (this.minBookingAmount && subtotal < this.minBookingAmount) {
    return {
      valid: false,
      message: `Minimum booking subtotal of ₹${this.minBookingAmount.toLocaleString('en-IN')} required to use this coupon.`,
    };
  }

  if (this.applicablePackages && this.applicablePackages.length > 0 && packageId) {
    const isApplicable = this.applicablePackages.some(
      (pkgId) => pkgId.toString() === packageId.toString()
    );
    if (!isApplicable) {
      return { valid: false, message: 'This coupon is not valid for the selected tour package.' };
    }
  }

  let calculatedDiscount = 0;

  if (this.discountType === 'percentage') {
    calculatedDiscount = Math.round(subtotal * (this.discountValue / 100));
    if (this.maxDiscount && this.maxDiscount > 0) {
      calculatedDiscount = Math.min(calculatedDiscount, this.maxDiscount);
    }
  } else if (this.discountType === 'flat') {
    calculatedDiscount = Math.min(this.discountValue, subtotal);
  } else if (this.discountType === 'per_person') {
    calculatedDiscount = this.discountValue * (totalPersons || 1);
    if (this.maxDiscount && this.maxDiscount > 0) {
      calculatedDiscount = Math.min(calculatedDiscount, this.maxDiscount);
    }
  }

  calculatedDiscount = Math.max(0, Math.min(calculatedDiscount, subtotal));

  return {
    valid: true,
    discountAmount: calculatedDiscount,
    coupon: {
      code: this.code,
      title: this.title,
      discountType: this.discountType,
      discountValue: this.discountValue,
      maxDiscount: this.maxDiscount,
      minBookingAmount: this.minBookingAmount || 0,
      targetType: this.targetType,
      isExclusive: this.targetType === 'specific_users',
    },
    message: `Coupon ${this.code} applied successfully! You saved ₹${calculatedDiscount.toLocaleString('en-IN')}.`,
  };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
