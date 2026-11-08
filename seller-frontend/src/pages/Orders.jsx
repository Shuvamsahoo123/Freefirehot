import { useState } from 'react';
import { Search, ClipboardList, Filter, X, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OrderCard from '../components/OrderCard';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const TYPE_FILTERS = ['All Types', 'Delivery', 'Pickup'];

export default function Orders() {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  // Filter by status tab
  let filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.orderStatus === activeTab);

  // Filter by order type
  if (typeFilter !== 'All Types') {
    filtered = filtered.filter((o) => o.orderType === typeFilter);
  }

  // Filter by date
  if (dateFilter) {
    filtered = filtered.filter((o) => {
      // Parse the order date "25 Nov 2024" format and compare with input date
      const orderDate = new Date(o.date);
      const filterDate = new Date(dateFilter);
      return (
        orderDate.getFullYear() === filterDate.getFullYear() &&
        orderDate.getMonth() === filterDate.getMonth() &&
        orderDate.getDate() === filterDate.getDate()
      );
    });
  }

  // Filter by search (order ID or phone)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().replace(/\s/g, '');
    filtered = filtered.filter(
      (o) =>
        o.orderId.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, '').includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Header */}
      <div className="mb-4 px-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <ClipboardList size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Orders</h2>
            <p className="text-xs text-gray-500 font-medium">{orders.length} total orders today</p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID, name, or phone..."
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all shadow-card"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter toggle + Type filter + Date filter */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            showFilters || typeFilter !== 'All Types'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter size={13} />
          Filter
        </button>

        {/* Date filter */}
        <div className="relative">
          <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`pl-7 pr-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors appearance-none ${
              dateFilter
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
            }`}
          />
        </div>

        {/* Active filter chips */}
        {typeFilter !== 'All Types' && (
          <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-semibold">
            {typeFilter}
            <button onClick={() => setTypeFilter('All Types')}>
              <X size={12} />
            </button>
          </span>
        )}
        {dateFilter && (
          <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-[11px] font-semibold">
            {new Date(dateFilter).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            <button onClick={() => setDateFilter('')}>
              <X size={12} />
            </button>
          </span>
        )}
      </div>

      {/* Type filter pills */}
      {showFilters && (
        <div className="flex gap-2 mb-4 animate-fade-in overflow-x-auto hide-scrollbar">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setShowFilters(false);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                typeFilter === type
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto hide-scrollbar">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === 'all'
            ? orders.length
            : orders.filter((o) => o.orderStatus === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-pill ${
                activeTab === tab.key ? 'tab-pill-active' : 'tab-pill-inactive'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Order cards */}
      <div className="space-y-3 stagger-children">
        {filtered.length > 0 ? (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-gray-100/80">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ClipboardList size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'No orders found for your search' : 'No orders in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
