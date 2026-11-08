import express from 'express';
import {
  getReviews,
  toggleReviewVerification,
  deleteReview,
  createReview,
} from '../controllers/reviewController.js';

import mongoose from 'mongoose';
const router = express.Router();

router.get('/collections', async (req, res) => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  res.json({ collections: collections.map(c => c.name) });
});

router.get('/', getReviews);
router.post('/', createReview); // Optionally for testing or public website
router.patch('/:id/verify', toggleReviewVerification);
router.delete('/:id', deleteReview);

export default router;
