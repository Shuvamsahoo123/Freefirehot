import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    strict: false, // In case customer frontend uses different fields
  }
);

// Map to the existing 'reviews' collection in MongoDB
const Review = mongoose.model('Review', reviewSchema, 'reviews');

export default Review;
