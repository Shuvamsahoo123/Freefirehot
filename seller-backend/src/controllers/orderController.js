import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import mongoose from 'mongoose';

const mapOrderForFrontend = (orderDoc) => {
  const obj = orderDoc.toObject();
  if (obj.paymentStatus === 'PENDING_VERIFICATION' || obj.paymentStatus === 'VERIFICATION_PENDING') obj.paymentStatus = 'verification_pending';
  if (obj.paymentStatus === 'PENDING') obj.paymentStatus = 'pending';
  if (obj.paymentStatus === 'VERIFIED') obj.paymentStatus = 'verified';
  if (obj.paymentStatus === 'REJECTED') obj.paymentStatus = 'rejected';

  if (!obj.paymentTime && obj.createdAt) {
    obj.paymentTime = new Date(obj.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (obj.orderStatus === 'RECEIVED') obj.orderStatus = 'pending';
  if (obj.orderStatus === 'CONFIRMED') obj.orderStatus = 'confirmed';
  if (obj.orderStatus === 'ACCEPTED') obj.orderStatus = 'accepted';
  if (obj.orderStatus === 'PREPARING') obj.orderStatus = 'preparing';
  if (obj.orderStatus === 'READY') obj.orderStatus = 'ready';
  if (obj.orderStatus === 'OUT-FOR-DELIVERY') obj.orderStatus = 'out-for-delivery';
  if (obj.orderStatus === 'COMPLETED') obj.orderStatus = 'completed';
  if (obj.orderStatus === 'CANCELLED') obj.orderStatus = 'cancelled';
  if (obj.orderType && obj.orderType.toLowerCase() === 'delivery') obj.orderType = 'Delivery';
  if (obj.orderType && obj.orderType.toLowerCase() === 'pickup') obj.orderType = 'Pickup';
  if (obj.orderType && obj.orderType.toLowerCase() === 'dine-in') obj.orderType = 'Dine-In';

  // Flexible UTR and Screenshot mapping
  obj.upiTransactionId = obj.upiTransactionId || obj.utrNumber || obj.utr || obj.transactionId || null;
  
  const rawScreenshot = obj.paymentScreenshot || obj.screenshot || obj.receipt || obj.paymentProof || obj.image || obj.utrImage || obj.paymentImage || obj.screenshotUrl || obj.paymentScreenshotUrl;
  if (typeof rawScreenshot === 'object' && rawScreenshot !== null) {
    obj.paymentScreenshot = rawScreenshot.url || rawScreenshot.secure_url || rawScreenshot.imageUrl || rawScreenshot.src || rawScreenshot.image?.url || null;
  } else if (typeof rawScreenshot === 'string') {
    obj.paymentScreenshot = rawScreenshot;
  } else {
    obj.paymentScreenshot = null;
  }

  return obj;
};

// Get orders pending payment verification
export async function getPendingPayments(req, res) {
  try {
    const rawOrders = await Order.find({ paymentStatus: { $in: ['verification_pending', 'PENDING_VERIFICATION'] } }).sort({ createdAt: -1 });
    const orders = rawOrders.map(mapOrderForFrontend);
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Failed to get pending payments:', error);
    return res.status(500).json({ success: false, message: 'Failed to get pending payments.' });
  }
}

// Get a single order by ID
export async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    
    const obj = mapOrderForFrontend(order);
    return res.status(200).json({ success: true, data: obj });
  } catch (error) {
    console.error('Failed to get order:', error);
    return res.status(500).json({ success: false, message: 'Failed to get order.' });
  }
}

// Verify Payment
export async function verifyPayment(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const paymentProofExists = Boolean(
      order.upiTransactionId || order.utrNumber || order.utr || order.transactionId ||
      order.paymentScreenshot?.url || order.paymentScreenshot || order.screenshot ||
      order.receipt || order.paymentProof || order.paymentImage || order.screenshotUrl ||
      order.paymentScreenshotUrl
    );
    const canVerify = ['verification_pending', 'VERIFICATION_PENDING', 'PENDING_VERIFICATION'].includes(order.paymentStatus) ||
      (['pending', 'PENDING'].includes(order.paymentStatus) && paymentProofExists);
    if (!canVerify) {
      return res.status(400).json({ success: false, message: 'Payment is not in a pending verification state.' });
    }

    order.paymentStatus = 'VERIFIED';
    order.paymentVerifiedAt = new Date();
    // Assuming there's a seller ID from auth context, setting a placeholder string if not.
    order.verifiedBy = req.user ? req.user._id : null; 
    
    // Update order status if it was pending
    if (order.orderStatus === 'pending' || order.orderStatus === 'RECEIVED') {
      order.orderStatus = 'CONFIRMED';
    }

    const updatedOrder = await order.save();
    
    const obj = updatedOrder.toObject();
    if (obj.paymentStatus === 'PENDING_VERIFICATION') obj.paymentStatus = 'verification_pending';
    if (obj.paymentStatus === 'PENDING') obj.paymentStatus = 'pending';
    if (obj.paymentStatus === 'VERIFIED') obj.paymentStatus = 'verified';
    if (obj.orderStatus === 'RECEIVED') obj.orderStatus = 'pending';
    if (obj.orderStatus === 'CONFIRMED') obj.orderStatus = 'confirmed';
    if (obj.orderType && obj.orderType.toLowerCase() === 'delivery') obj.orderType = 'Delivery';
    if (obj.orderType && obj.orderType.toLowerCase() === 'pickup') obj.orderType = 'Pickup';
    if (obj.orderType && obj.orderType.toLowerCase() === 'dine-in') obj.orderType = 'Dine-In';

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: obj,
    });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
}

// Reject Payment
export async function rejectPayment(req, res) {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus !== 'verification_pending' && order.paymentStatus !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ success: false, message: 'Payment is not in a pending verification state.' });
    }

    order.paymentStatus = 'REJECTED';
    order.rejectionReason = reason;
    order.paymentVerifiedAt = new Date();
    order.verifiedBy = req.user ? req.user._id : null;
    
    // Leave the order status as is, or mark it as cancelled based on shop policy
    // We'll leave it as is so the customer can potentially resubmit payment if allowed.

    const updatedOrder = await order.save();
    
    const obj = updatedOrder.toObject();
    if (obj.paymentStatus === 'PENDING_VERIFICATION') obj.paymentStatus = 'verification_pending';
    if (obj.paymentStatus === 'PENDING') obj.paymentStatus = 'pending';
    if (obj.paymentStatus === 'VERIFIED') obj.paymentStatus = 'verified';
    if (obj.paymentStatus === 'REJECTED') obj.paymentStatus = 'rejected';
    if (obj.orderStatus === 'RECEIVED') obj.orderStatus = 'pending';
    if (obj.orderStatus === 'CONFIRMED') obj.orderStatus = 'confirmed';
    if (obj.orderType && obj.orderType.toLowerCase() === 'delivery') obj.orderType = 'Delivery';
    if (obj.orderType && obj.orderType.toLowerCase() === 'pickup') obj.orderType = 'Pickup';
    if (obj.orderType && obj.orderType.toLowerCase() === 'dine-in') obj.orderType = 'Dine-In';

    return res.status(200).json({
      success: true,
      message: 'Payment rejected successfully.',
      data: obj,
    });
  } catch (error) {
    console.error('Failed to reject payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject payment.' });
  }
}

// List all orders (for general order management)
export async function getOrders(req, res) {
  try {
    const filter = {};
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }
    const rawOrders = await Order.find(filter).sort({ createdAt: -1 });
    
    // Map statuses to match frontend expectations
    const orders = rawOrders.map(mapOrderForFrontend);

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Failed to get orders:', error);
    return res.status(500).json({ success: false, message: 'Failed to get orders.' });
  }
}

// Update Order Status
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const completingOrder = status.toLowerCase() === 'completed' && order.orderStatus !== 'COMPLETED';
    const session = completingOrder ? await mongoose.startSession() : null;
    if (session) session.startTransaction();
    try {
      if (completingOrder && !order.inventoryDeductedAt) {
        for (const orderedItem of order.items) {
          const menuItem = await MenuItem.findOne({ name: orderedItem.name })
            .collation({ locale: 'en', strength: 2 })
            .session(session);
          if (!menuItem) continue;
          menuItem.booked += Number(orderedItem.quantity) || 0;
          await menuItem.save({ session });
        }
        order.inventoryDeductedAt = new Date();
      }
      order.orderStatus = status.toUpperCase();
      const updatedOrder = await order.save(session ? { session } : undefined);
      if (session) await session.commitTransaction();
    
      const obj = updatedOrder.toObject();
      if (obj.paymentStatus === 'PENDING_VERIFICATION') obj.paymentStatus = 'verification_pending';
      if (obj.paymentStatus === 'PENDING') obj.paymentStatus = 'pending';
      if (obj.paymentStatus === 'VERIFIED') obj.paymentStatus = 'verified';
      if (obj.paymentStatus === 'REJECTED') obj.paymentStatus = 'rejected';
      if (obj.orderStatus === 'RECEIVED') obj.orderStatus = 'pending';
      if (obj.orderStatus === 'CONFIRMED') obj.orderStatus = 'confirmed';
      if (obj.orderStatus === 'ACCEPTED') obj.orderStatus = 'accepted';
      if (obj.orderStatus === 'PREPARING') obj.orderStatus = 'preparing';
      if (obj.orderStatus === 'READY') obj.orderStatus = 'ready';
      if (obj.orderStatus === 'OUT-FOR-DELIVERY') obj.orderStatus = 'out-for-delivery';
      if (obj.orderStatus === 'COMPLETED') obj.orderStatus = 'completed';
      if (obj.orderStatus === 'CANCELLED') obj.orderStatus = 'cancelled';
      if (obj.orderType && obj.orderType.toLowerCase() === 'delivery') obj.orderType = 'Delivery';
      if (obj.orderType && obj.orderType.toLowerCase() === 'pickup') obj.orderType = 'Pickup';
      if (obj.orderType && obj.orderType.toLowerCase() === 'dine-in') obj.orderType = 'Dine-In';

      return res.status(200).json({ success: true, data: obj });
    } catch (error) {
      if (session) await session.abortTransaction();
      throw error;
    } finally {
      if (session) await session.endSession();
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

// Reject Order
export async function rejectOrder(req, res) {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = 'CANCELLED';
    order.rejectionReason = reason;
    const updatedOrder = await order.save();
    
    const obj = updatedOrder.toObject();
    if (obj.paymentStatus === 'PENDING_VERIFICATION') obj.paymentStatus = 'verification_pending';
    if (obj.paymentStatus === 'PENDING') obj.paymentStatus = 'pending';
    if (obj.paymentStatus === 'VERIFIED') obj.paymentStatus = 'verified';
    if (obj.paymentStatus === 'REJECTED') obj.paymentStatus = 'rejected';
    if (obj.orderStatus === 'RECEIVED') obj.orderStatus = 'pending';
    if (obj.orderStatus === 'CONFIRMED') obj.orderStatus = 'confirmed';
    if (obj.orderStatus === 'ACCEPTED') obj.orderStatus = 'accepted';
    if (obj.orderStatus === 'PREPARING') obj.orderStatus = 'preparing';
    if (obj.orderStatus === 'READY') obj.orderStatus = 'ready';
    if (obj.orderStatus === 'OUT-FOR-DELIVERY') obj.orderStatus = 'out-for-delivery';
    if (obj.orderStatus === 'COMPLETED') obj.orderStatus = 'completed';
    if (obj.orderStatus === 'CANCELLED') obj.orderStatus = 'cancelled';
    if (obj.orderType && obj.orderType.toLowerCase() === 'delivery') obj.orderType = 'Delivery';
    if (obj.orderType && obj.orderType.toLowerCase() === 'pickup') obj.orderType = 'Pickup';
    if (obj.orderType && obj.orderType.toLowerCase() === 'dine-in') obj.orderType = 'Dine-In';

    return res.status(200).json({ success: true, data: obj });
  } catch (error) {
    console.error('Failed to reject order:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject order.' });
  }
}

// Collect Remaining Payment
export async function collectRemainingPayment(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.remainingAmount = 0;
    order.remainingPaidAt = new Date();
    order.paymentStatus = 'VERIFIED';
    order.paymentVerifiedAt = order.paymentVerifiedAt || order.remainingPaidAt;
    const updatedOrder = await order.save();
    
    const obj = mapOrderForFrontend(updatedOrder);

    return res.status(200).json({ success: true, data: obj });
  } catch (error) {
    console.error('Failed to collect remaining payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to collect remaining payment.' });
  }
}
