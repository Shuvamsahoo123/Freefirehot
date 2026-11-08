import { getOrderStatusLabel, getOrderStatusColor } from '../data/mockData';

export default function StatusBadge({ type = 'order', status, label, size = 'sm' }) {
  // For custom label/color
  if (label) {
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${status}`}>
        {label}
      </span>
    );
  }

  // Payment status badge
  if (type === 'payment') {
    const configs = {
      confirmed: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        dot: 'bg-green-500',
        label: 'Payment Confirmed',
      },
      verified: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        dot: 'bg-green-500',
        label: 'Payment Confirmed',
      },
      pending: {
        bg: 'bg-red-50',
        text: 'text-red-600',
        dot: 'bg-red-500',
        label: 'Payment Pending',
      },
      rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-600',
        label: 'Payment Rejected',
      },
    };
    const config = configs[status] || configs.pending;
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  // Order status badge
  if (type === 'order') {
    const colors = getOrderStatusColor(status);
    const statusLabel = getOrderStatusLabel(status);
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses} ${colors.bg} ${colors.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {statusLabel}
      </span>
    );
  }

  // Order type badge
  if (type === 'orderType') {
    const configs = {
      Delivery: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border border-blue-200' },
      Pickup: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border border-orange-200' },
      'Dine-In': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border border-purple-200' },
    };
    const config = configs[status] || configs.Pickup;
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
      <span className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}>
        {status}
      </span>
    );
  }

  // Menu item status
  if (type === 'menu') {
    const configs = {
      available: { bg: 'bg-green-50', text: 'text-green-600', border: 'border border-green-200', label: 'Available' },
      soldout: { bg: 'bg-red-50', text: 'text-red-600', border: 'border border-red-200', label: 'Sold Out' },
      paused: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border border-yellow-200', label: 'Paused' },
      disabled: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border border-gray-200', label: 'Disabled' },
    };
    const config = configs[status] || configs.available;
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
      <span className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  }

  // Booking status
  if (type === 'booking') {
    const configs = {
      pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Confirmed' },
      completed: { bg: 'bg-green-50', text: 'text-green-600', label: 'Completed' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' },
    };
    const config = configs[status] || configs.pending;
    const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
      <span className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  return null;
}
