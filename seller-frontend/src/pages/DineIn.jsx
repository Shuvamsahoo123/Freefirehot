import { useState } from 'react';
import { Users, Clock, Phone, Sparkles, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';

export default function DineIn() {
  const { dineInBookings, updateDineInBooking } = useApp();
  const [activeTab, setActiveTab] = useState('bookings');

  const activeBookings = dineInBookings.filter(
    (b) => b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled'
  );
  const completedBookings = dineInBookings.filter(
    (b) => b.bookingStatus === 'completed'
  );

  const tabs = [
    { key: 'bookings', label: 'Bookings', icon: CalendarCheck, count: activeBookings.length },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: completedBookings.length },
  ];

  const currentList = activeTab === 'bookings' ? activeBookings : completedBookings;

  const getNextAction = (booking) => {
    if (booking.bookingStatus === 'pending') {
      return { label: 'Confirm Booking', action: 'confirmed' };
    }
    if (booking.bookingStatus === 'confirmed') {
      return { label: 'Mark Completed', action: 'completed' };
    }
    return null;
  };

  const handleAction = (bookingId, newStatus) => {
    updateDineInBooking(bookingId, { bookingStatus: newStatus });
  };

  const renderBookingCard = (booking) => {
    const nextAction = getNextAction(booking);
    const itemSummary = booking.items
      .map((i) => `${i.quantity} × ${i.name}`)
      .join(', ');

    return (
      <div
        key={booking.id}
        className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80 animate-fade-in hover-lift gradient-border transition-all duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-sm font-bold text-gray-900">
              #{booking.bookingId}
            </span>
            <p className="text-base font-semibold text-gray-800 mt-0.5">
              {booking.customerName}
            </p>
          </div>
          <StatusBadge type="booking" status={booking.bookingStatus} />
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3 bg-gradient-to-r from-purple-50/40 to-transparent p-3 rounded-xl">
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={14} className="text-purple-500" />
            </div>
            <span className="font-medium">{booking.people} People</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🍗</span>
            </div>
            <span className="font-medium">{itemSummary}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-blue-500" />
            </div>
            <span className="font-medium">{booking.time}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-gray-600">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone size={14} className="text-green-500" />
            </div>
            <span className="font-medium">{booking.phone}</span>
          </div>
        </div>

        {/* Payment status */}
        <div className="mb-3">
          <StatusBadge type="payment" status={booking.paymentStatus} />
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">
            ₹{booking.totalAmount}
          </span>
          {nextAction && (
            <button
              onClick={() => handleAction(booking.id, nextAction.action)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-semibold text-xs hover:bg-primary-600 transition-all duration-200 touch-active shadow-sm"
            >
              {nextAction.label}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5 px-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Dine-In Experience</h2>
            <p className="text-xs text-gray-500 font-medium">Manage your table bookings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 border ${
                isActive
                  ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-xs font-semibold ${isActive ? 'text-purple-700' : 'text-gray-600'}`}>
                {tab.label}
                <span className="ml-1 opacity-60">({tab.count})</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-3 stagger-children">
        {currentList.length > 0 ? (
          currentList.map(renderBookingCard)
        ) : (
          <div className="text-center py-14 bg-white rounded-2xl shadow-card border border-gray-100/80">
            <p className="text-gray-400 text-sm">
              {activeTab === 'bookings' ? 'No active bookings' : 'No completed bookings'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
