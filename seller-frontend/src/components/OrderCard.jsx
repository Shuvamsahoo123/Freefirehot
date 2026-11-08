import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function OrderCard({ order }) {
  const navigate = useNavigate();
  const firstItem = order.items[0];
  const itemSummary = order.items.length === 1
    ? `${firstItem.quantity} × ${firstItem.name}`
    : `${firstItem.quantity} × ${firstItem.name} +${order.items.length - 1} more`;

  return (
    <button
      onClick={() => navigate(`/orders/${order._id || order.id}`)}
      className="w-full bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover border border-gray-100/80 transition-all duration-300 touch-active text-left hover-lift gradient-border group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-900">Order</span>
          </div>

          {/* Customer name */}
          <p className="text-sm font-medium text-gray-700 mb-1">{order.customer?.name || order.customerName || 'Customer'}</p>

          {/* Items */}
          <p className="text-sm text-gray-500 mb-1.5">{itemSummary}</p>

          {/* Total */}
          <p className="text-lg font-extrabold text-gray-900 mb-2 tracking-tight">₹{order.totalAmount}</p>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge type="payment" status={order.paymentStatus} />
            {order.orderStatus !== 'pending' && (
              <StatusBadge type="order" status={order.orderStatus} />
            )}
          </div>
        </div>

        {/* Right side - time and type */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 font-medium">{order.orderTime}</span>
          <StatusBadge type="orderType" status={order.orderType} />
        </div>
      </div>

      {/* Bottom decorative accent line */}
      <div className="mt-3 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-primary-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>View details</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </button>
  );
}
