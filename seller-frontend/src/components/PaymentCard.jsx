import { CheckCircle, XCircle, Copy, Clock, IndianRupee, Banknote, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function PaymentCard({ order, onConfirm, onReject, isConfirmed }) {
  const { collectRemainingPayment } = useApp();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyUTR = () => {
    navigator.clipboard.writeText(order.upiTransactionId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const itemSummary = order.items
    .map((i) => `${i.quantity}× ${i.name}`)
    .join(', ');

  const hasRemainingDue = order.remainingAmount > 0 && !order.remainingPaidAt;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80 hover-lift gradient-border transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm font-bold text-gray-900">#{order.orderId}</span>
          <p className="text-base font-semibold text-gray-800 mt-0.5">
            {order.customer?.name || order.customerName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{itemSummary}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
          order.paymentStatus === 'verified'
            ? 'bg-green-100 text-green-700'
            : order.paymentStatus === 'rejected'
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {order.paymentStatus === 'verified' ? '✓ Verified' : order.paymentStatus === 'rejected' ? '✕ Rejected' : '● Pending'}
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-gradient-to-r from-gray-50 to-transparent p-3 rounded-xl mb-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1.5">
            <IndianRupee size={13} />
            Total Amount
          </span>
          <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium flex items-center gap-1.5">
            <Banknote size={13} />
            Advance (50%)
          </span>
          <span className="font-semibold text-blue-600">₹{order.advanceAmount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-medium">Remaining</span>
          <span className={`font-semibold ${order.remainingPaidAt ? 'text-green-600' : 'text-orange-600'}`}>
            {order.remainingPaidAt ? '₹0 (Collected)' : `₹${order.remainingAmount}`}
          </span>
        </div>
      </div>

      {/* UPI Transaction ID */}
      {order.upiTransactionId && (
        <div className="flex items-center gap-2 mb-3 bg-blue-50/60 rounded-lg px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">UPI Transaction ID (UTR)</p>
            <p className="text-sm font-mono font-bold text-gray-800 truncate">{order.upiTransactionId}</p>
          </div>
          <button
            onClick={copyUTR}
            className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            {copied ? (
              <CheckCircle size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-gray-400" />
            )}
          </button>
        </div>
      )}

      {/* Payment Screenshot */}
      {order.paymentScreenshot && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Payment Screenshot</p>
          <img
            src={order.paymentScreenshot}
            alt="Payment Screenshot"
            className="w-full h-32 object-cover rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(order.paymentScreenshot, '_blank')}
          />
        </div>
      )}

      {/* Payment time */}
      {order.paymentTime && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
          <Clock size={12} />
          <span>Submitted at {order.paymentTime}</span>
          {order.paymentVerifiedAt && (
            <span className="text-green-500"> · Verified at {order.paymentVerifiedAt}</span>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!isConfirmed && order.paymentStatus === 'verification_pending' && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onReject(order._id || order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-500 rounded-lg font-semibold text-xs hover:bg-red-50 transition-all touch-active"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            onClick={() => navigate(`/orders/${order._id || order.id}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-500 text-white rounded-lg font-semibold text-xs hover:bg-primary-600 transition-all touch-active shadow-sm"
          >
            <ExternalLink size={16} />
            Verify Payment
          </button>
        </div>
      )}

      {/* Collect remaining payment */}
      {isConfirmed && hasRemainingDue && (
        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={() => collectRemainingPayment(order._id || order.id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-orange-500 text-white rounded-lg font-semibold text-xs hover:bg-orange-600 transition-all touch-active shadow-sm"
          >
            <Banknote size={16} />
            Collect Remaining ₹{order.remainingAmount}
          </button>
        </div>
      )}

      {/* Remaining collected timestamp */}
      {order.remainingPaidAt && (
        <div className="pt-2 text-center">
          <span className="text-[11px] text-green-500 font-semibold">
            ✓ Remaining collected at {order.remainingPaidAt}
          </span>
        </div>
      )}
    </div>
  );
}
