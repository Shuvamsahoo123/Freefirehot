import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  subscription: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
