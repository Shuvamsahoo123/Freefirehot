import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Clock, Image as ImageIcon, AlertTriangle, X, MessageSquare, IndianRupee, Banknote, Truck, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getNextOrderAction, REJECTION_REASONS } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, updatePaymentStatus, rejectOrder, collectRemainingPayment } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [screenshotLoadFailed, setScreenshotLoadFailed] = useState(false);
  const [showDeliveryVerification, setShowDeliveryVerification] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [deliveryError, setDeliveryError] = useState('');

  const order = orders.find((o) => String(o._id || o.id) === String(id));

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="text-gray-400 text-sm mb-4">Order not found</p>
        <button
          onClick={() => navigate('/orders')}
          className="text-primary-500 font-semibold text-sm"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const nextAction = getNextOrderAction(order.orderStatus, order.paymentStatus, order.orderType);

  const hasRemainingDue = order.remainingAmount > 0 && !order.remainingPaidAt;
  const normalizedPaymentStatus = String(order.paymentStatus).toLowerCase();
  const isVerificationPending = normalizedPaymentStatus === 'verification_pending' || normalizedPaymentStatus === 'pending';
  const isVerified = normalizedPaymentStatus === 'verified' || normalizedPaymentStatus === 'confirmed';
  
  const canCollectRemaining = isVerified && hasRemainingDue &&
    order.orderStatus !== 'cancelled';

  const handleVerifyPayment = () => {
    updatePaymentStatus(order._id || order.id, 'verified');
  };

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (isVerificationPending) {
        await updatePaymentStatus(order._id || order.id, 'verified');
        if (order.orderStatus === 'pending' || order.orderStatus === 'PENDING') {
           await updateOrderStatus(order._id || order.id, 'accepted');
        }
      } else if ((order.orderType === 'Delivery' || order.orderType === 'delivery') && nextAction.action === 'completed') {
        setShowDeliveryVerification(true);
      } else if (nextAction.action) {
        await updateOrderStatus(order._id || order.id, nextAction.action);
      }
    } catch (error) {
      alert("Failed to process action. The server might be unreachable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyDelivery = () => {
    if (deliveryCode.trim() === String(order.orderId)) {
      updateOrderStatus(order._id || order.id, 'completed');
      setShowDeliveryVerification(false);
      setDeliveryCode('');
      setDeliveryError('');
    } else {
      setDeliveryError('Invalid Order ID. Please check with the customer.');
    }
  };

  const handleReject = () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (reason.trim()) {
      rejectOrder(order._id || order.id, reason);
      setShowRejectModal(false);
    }
  };

  const canReject = order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled';

  return (
    <div className="px-4 py-5 animate-fade-in pb-32">
      {/* Order ID and type */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Order from {order.customer?.name || order.customerName || 'Customer'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
        </div>
        <StatusBadge type="orderType" status={order.orderType} size="md" />
      </div>

      {/* Rejection reason (if cancelled) */}
      {order.rejectionReason && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 animate-fade-in">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Rejection Reason</p>
            <p className="text-sm text-red-700 mt-0.5">{order.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Customer info */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
        <h3 className="text-base font-bold text-gray-900 mb-3">
          {order.customer?.name || order.customerName}
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone size={16} className="text-gray-400 flex-shrink-0" />
            <span>{order.customer?.mobile || order.phone}</span>
          </div>
          {(order.orderType === 'Delivery' || order.orderType === 'delivery') && (order.deliveryAddress || order.address || order.customer?.address) && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span>
                {order.deliveryAddress?.street || (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '') || order.address?.street || (typeof order.address === 'string' ? order.address : '') || order.customer?.address?.street || (typeof order.customer?.address === 'string' ? order.customer.address : '')}
              </span>
            </div>
          )}
          {order.scheduledTime && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={16} className="text-gray-400 flex-shrink-0" />
              <span>{order.scheduledTime}</span>
            </div>
          )}
          {order.specialInstructions && (
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MessageSquare size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="italic">{order.specialInstructions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
          Order Items
        </h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">🍛</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">× {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-700">Total</span>
          <span className="text-lg font-extrabold text-gray-900">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
          Payment Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Payment Status</span>
            <StatusBadge type="payment" status={order.paymentStatus} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1.5"><IndianRupee size={13} /> Total</span>
            <span className="text-sm font-bold text-gray-900">₹{order.totalAmount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1.5"><Banknote size={13} /> Advance (50%)</span>
            <span className="text-sm font-semibold text-blue-600">₹{order.advanceAmount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Remaining</span>
            <span className={`text-sm font-semibold ${order.remainingPaidAt ? 'text-green-600' : 'text-orange-600'}`}>
              {order.remainingPaidAt ? '₹0 (Collected)' : `₹${order.remainingAmount}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">UPI Transaction ID</span>
            <span className="text-sm font-semibold text-gray-700 font-mono">
              {order.transactionId || order.upiTransactionId || order.utrNumber || 'Not provided'}
            </span>
          </div>

          {order.paymentVerifiedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Verified At</span>
              <span className="text-sm font-semibold text-green-600">{order.paymentVerifiedAt}</span>
            </div>
          )}
        </div>



        {/* Payment Verification Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Payment Date & Time</span>
            <span className="text-sm font-semibold text-gray-800">
              {order.paymentTime || order.createdAt ? new Date(order.paymentTime || order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'Not provided'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Payment Screenshot</span>
            {(order.paymentScreenshot?.url || order.paymentScreenshot) ? (
              <button
                onClick={() => {
                  setScreenshotLoadFailed(false);
                  setShowScreenshot(true);
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors touch-active shadow-sm"
              >
                <ImageIcon size={14} />
                View Screenshot
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-400">
                <ImageIcon size={14} />
                Not provided
              </span>
            )}
          </div>
        </div>
      </div>


      {/* Action buttons - Inline */}
      {order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled' && !showDeliveryVerification && (
        <div className="mb-6 flex gap-3">
          {canReject && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-3 border-2 border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all touch-active bg-white shadow-sm"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={handleAction}
            disabled={isProcessing || (!isVerificationPending && nextAction.disabled)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 touch-active shadow-md ${
              isProcessing
                ? 'bg-gray-400 text-white cursor-wait'
                : isVerificationPending
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-green-500/25'
                : nextAction.disabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/25'
            }`}
          >
            {isProcessing ? 'Processing...' : (isVerificationPending ? 'Verify & Accept Order' : nextAction.label)}
          </button>
        </div>
      )}



      {/* Remaining collected confirmation */}
      {order.remainingPaidAt && (
        <div className="bg-green-50 rounded-2xl p-3 border border-green-200/60 mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-green-600">✓ Full payment collected at {order.remainingPaidAt}</span>
        </div>
      )}

      {/* Delivery Verification Inline */}
      {showDeliveryVerification && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-primary-100 mb-4 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-md font-extrabold text-gray-900">Deliver Order</h3>
            <button
              onClick={() => {
                setShowDeliveryVerification(false);
                setDeliveryCode('');
                setDeliveryError('');
              }}
              className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Enter the customer's Order ID to verify successful delivery.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={deliveryCode}
                onChange={(e) => {
                  setDeliveryCode(e.target.value);
                  setDeliveryError('');
                }}
                placeholder="Order ID (e.g. 1001)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50"
              />
              {deliveryError && (
                <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle size={10} />
                  {deliveryError}
                </p>
              )}
            </div>

            <button
              onClick={handleVerifyDelivery}
              className="px-5 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/25"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Collect Remaining Payment */}
      {canCollectRemaining && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 shadow-card border border-orange-200/60 mb-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Remaining Payment</p>
              <p className="text-xs text-gray-500 mt-0.5">Collect from customer at pickup/delivery</p>
            </div>
            <span className="text-xl font-extrabold text-orange-600">₹{order.remainingAmount}</span>
          </div>
          <button
            onClick={() => collectRemainingPayment(order._id || order.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all touch-active shadow-md"
          >
            <Banknote size={18} />
            Mark ₹{order.remainingAmount} as Collected
          </button>
        </div>
      )}

      {/* Order Status */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
          Order Status
        </h3>
        <StatusBadge type="order" status={order.orderStatus} />
      </div>



      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in" onClick={() => setShowRejectModal(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Reject Order</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {isVerificationPending && order.advanceAmount > 0 && (
              <div className="mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800">Refund Required!</h4>
                    <p className="text-xs text-orange-700 mt-1">
                      You must manually refund the <strong>₹{order.advanceAmount}</strong> advance payment via UPI to the customer's phone number: 
                      <strong className="block text-sm mt-1">{order.customer?.mobile || order.phone}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">Select a reason for rejecting this order:</p>

            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedReason === reason
                      ? 'bg-red-50 border-2 border-red-300 text-red-700'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter your reason..."
                rows={2}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/50 resize-none mb-4"
              />
            )}

            <button
              onClick={handleReject}
              disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
              className="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {showScreenshot && order.paymentScreenshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in p-4"
          onClick={() => setShowScreenshot(false)}
        >
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowScreenshot(false)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
            <img
              src={order.paymentScreenshot?.url || order.paymentScreenshot || ''}
              alt="Payment Screenshot"
              className="w-full rounded-2xl shadow-2xl"
              onError={() => setScreenshotLoadFailed(true)}
            />
            {screenshotLoadFailed && (
              <p className="mt-3 rounded-lg bg-white p-3 text-center text-sm text-red-600">
                This screenshot URL could not be loaded. Check that the image is still available in Cloudinary.
              </p>
            )}
            <div className="mt-3 text-center">
              <p className="text-white/80 text-sm font-medium">UTR: {order.transactionId || order.upiTransactionId}</p>
              <p className="text-white/60 text-xs mt-1">Submitted at {order.paymentTime}</p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
