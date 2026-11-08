import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    customer: {
      name: String,
      mobile: String,
      email: String,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    orderType: {
      type: String,
    },
    paymentStatus: {
      type: String,
      default: 'pending',
    },
    orderStatus: {
      type: String,
      default: 'pending',
    },
    upiTransactionId: {
      type: String,
      default: null,
    },
    paymentScreenshot: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },
    paymentTime: {
      type: Date,
      default: null,
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming there's a User model for sellers, or we can just leave it as String for now if none exists.
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    remainingPaidAt: {
      type: Date,
      default: null,
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    scheduledTime: {
      type: String,
      default: '',
    },
    specialInstructions: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
