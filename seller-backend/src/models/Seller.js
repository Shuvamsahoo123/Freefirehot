import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  _id: { type: String, default: 'primary-seller' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Seller', sellerSchema);
