import Review from '../models/Review.js';

// Get all reviews (for Seller Panel)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Failed to get reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// Toggle verification status of a review
export const toggleReviewVerification = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    
    review.isApproved = !review.isApproved;
    await review.save();
    
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Failed to verify review:', error);
    res.status(500).json({ success: false, message: 'Failed to update review status.' });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

// Create a mock review (for testing purposes, if customer frontend uses this API)
export const createReview = async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    const newReview = await Review.create({ customerName, rating, comment, isApproved: false });
    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    console.error('Failed to create review:', error);
    res.status(500).json({ success: false, message: 'Failed to create review.' });
  }
};
