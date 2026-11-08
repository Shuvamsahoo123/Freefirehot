import express from 'express';
import { getOrders, getPendingPayments, getOrder, verifyPayment, rejectPayment, updateOrderStatus, rejectOrder, collectRemainingPayment } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/pending-payments', getPendingPayments);
router.get('/:id', getOrder);
router.put('/:id/verify', verifyPayment);
router.put('/:id/reject-payment', rejectPayment); // renamed to avoid conflict
router.put('/:id/status', updateOrderStatus);
router.put('/:id/reject', rejectOrder);

router.put('/:id/collect', collectRemainingPayment);

export default router;
