import { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  XCircle,
  CheckCircle,
  Banknote,
  Clock,
  Truck,
  UtensilsCrossed,
  Package,
  Download,
  CalendarDays,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const PERIOD_TABS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

export default function Reports() {
  const { orders, dineInBookings } = useApp();
  const [activePeriod, setActivePeriod] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Filter orders by time period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return orders.filter((o) => {
      const orderDate = new Date(o.date);

      switch (activePeriod) {
        case 'today':
          return orderDate >= todayStart;
        case 'week': {
          const weekStart = new Date(todayStart);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return orderDate >= weekStart;
        }
        case 'month': {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return orderDate >= monthStart;
        }
        case 'custom': {
          const from = customFrom ? new Date(customFrom) : new Date(0);
          const to = customTo ? new Date(customTo + 'T23:59:59') : new Date();
          return orderDate >= from && orderDate <= to;
        }
        default:
          return true; // 'all'
      }
    });
  }, [orders, activePeriod, customFrom, customTo]);

  // Compute stats from filtered orders
  const reportStats = useMemo(() => {
    const confirmedOrders = filteredOrders.filter((o) => o.paymentStatus === 'verified');
    const pendingOrders = filteredOrders.filter((o) => o.paymentStatus === 'verification_pending');

    const totalSales = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const advanceReceived = confirmedOrders.reduce((sum, o) => sum + o.advanceAmount, 0);
    const remainingDue = confirmedOrders
      .filter((o) => o.remainingAmount > 0)
      .reduce((sum, o) => sum + o.remainingAmount, 0);

    const completedRevenue = confirmedOrders
      .filter((o) => o.orderStatus === 'completed' && o.remainingAmount === 0)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const cancelledOrders = filteredOrders.filter((o) => o.orderStatus === 'cancelled').length;
    const completedOrders = filteredOrders.filter((o) => o.orderStatus === 'completed').length;

    // Item sales count
    const itemSales = {};
    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        itemSales[item.name].quantity += item.quantity;
        itemSales[item.name].revenue += item.quantity * item.price;
      });
    });
    const topItems = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity);

    // Order type split
    const orderTypeSplit = {
      Delivery: filteredOrders.filter((o) => o.orderType === 'Delivery').length,
      Pickup: filteredOrders.filter((o) => o.orderType === 'Pickup').length,
      'Dine-In': filteredOrders.filter((o) => o.orderType === 'Dine-In').length,
    };

    return {
      totalSales,
      advanceReceived,
      remainingDue,
      completedRevenue,
      pendingRevenue,
      cancelledOrders,
      completedOrders,
      topItems,
      orderTypeSplit,
      totalOrders: filteredOrders.length,
    };
  }, [filteredOrders]);

  const statCards = [
    {
      label: 'Total Orders',
      value: reportStats.totalOrders,
      icon: ShoppingBag,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Sales',
      value: `₹${reportStats.totalSales.toLocaleString()}`,
      icon: IndianRupee,
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-600',
    },
    {
      label: 'Advance Received',
      value: `₹${reportStats.advanceReceived.toLocaleString()}`,
      icon: Banknote,
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
    },
    {
      label: 'Remaining Due',
      value: `₹${reportStats.remainingDue.toLocaleString()}`,
      icon: Clock,
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
    },
    {
      label: 'Completed',
      value: reportStats.completedOrders,
      icon: CheckCircle,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Cancelled',
      value: reportStats.cancelledOrders,
      icon: XCircle,
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      textColor: 'text-red-600',
    },
  ];

  const typeIcons = {
    Delivery: Truck,
    Pickup: Package,
    'Dine-In': UtensilsCrossed,
  };

  const typeColors = {
    Delivery: 'bg-blue-500',
    Pickup: 'bg-orange-500',
    'Dine-In': 'bg-purple-500',
  };

  const totalTypeSplit = Object.values(reportStats.orderTypeSplit).reduce((a, b) => a + b, 0);

  // Export filtered orders as CSV
  const exportCSV = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Items', 'Total', 'Advance', 'Remaining', 'Type', 'Payment', 'Status', 'Date'];
    const rows = filteredOrders.map((o) => [
      o.orderId,
      o.customerName,
      o.phone,
      o.items.map((i) => `${i.quantity}x ${i.name}`).join('; '),
      o.totalAmount,
      o.advanceAmount,
      o.remainingAmount,
      o.orderType,
      o.paymentStatus,
      o.orderStatus,
      o.date,
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freefire-orders-${activePeriod}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Period label for display
  const periodLabel = PERIOD_TABS.find((t) => t.key === activePeriod)?.label || 'All Time';

  return (
    <div className="px-4 py-5 animate-fade-in pb-10">
      {/* Header */}
      <div className="mb-5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Sales & Reports</h2>
              <p className="text-xs text-gray-500 font-medium">{periodLabel} performance overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold text-xs transition-all hover:bg-gray-200"
              title="Print Report"
            >
              <Printer size={14} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold text-xs transition-all shadow-md hover:shadow-lg"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePeriod(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activePeriod === tab.key
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {activePeriod === 'custom' && (
        <div className="flex items-center gap-2 mb-4 bg-white rounded-xl p-3 shadow-card border border-gray-100/80 animate-fade-in">
          <CalendarDays size={14} className="text-indigo-400 flex-shrink-0" />
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-400"
              placeholder="From"
            />
            <span className="text-gray-400 text-xs">to</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-400"
              placeholder="To"
            />
          </div>
        </div>
      )}

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-3 shadow-card border border-gray-100/80 hover-lift transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${stat.iconBg} rounded-lg flex items-center justify-center shadow-md`}>
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              <p className={`text-xl font-extrabold tracking-tight ${stat.textColor}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Revenue Breakdown — Completed vs Pending vs Unverified */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee size={14} />
          Revenue Breakdown
        </h3>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700">Completed (Paid in Full)</span>
            </div>
            <span className="text-sm font-bold text-green-600">₹{reportStats.completedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <Clock size={14} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Remaining Due</span>
            </div>
            <span className="text-sm font-bold text-orange-600">₹{reportStats.remainingDue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-sm font-medium text-gray-700">Unverified Payments</span>
            </div>
            <span className="text-sm font-bold text-red-500">₹{reportStats.pendingRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-800">Total Expected</span>
            <span className="text-sm font-extrabold text-gray-900">
              ₹{(reportStats.totalSales + reportStats.pendingRevenue).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={14} />
          Top Selling Items
        </h3>
        <div className="space-y-3">
          {reportStats.topItems.map((item, index) => {
            const maxQty = reportStats.topItems[0]?.quantity || 1;
            const percentage = (item.quantity / maxQty) * 100;
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-4">{index + 1}</span>
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{item.quantity} qty</span>
                    <span className="text-xs text-gray-400 ml-2">₹{item.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {reportStats.topItems.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No sales data for this period</p>
          )}
        </div>
      </div>

      {/* Order Type Split */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag size={14} />
          Order Type Breakdown
        </h3>

        {/* Visual bar */}
        {totalTypeSplit > 0 && (
          <div className="flex rounded-full overflow-hidden h-4 mb-4">
            {Object.entries(reportStats.orderTypeSplit).map(([type, count]) => (
              count > 0 && (
                <div
                  key={type}
                  className={`${typeColors[type]} transition-all duration-500`}
                  style={{ width: `${(count / totalTypeSplit) * 100}%` }}
                />
              )
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          {Object.entries(reportStats.orderTypeSplit).map(([type, count]) => {
            const Icon = typeIcons[type];
            const pct = totalTypeSplit > 0 ? Math.round((count / totalTypeSplit) * 100) : 0;
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${typeColors[type]}`} />
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                  <span className="text-xs text-gray-400">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/80">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
          {activePeriod === 'all' ? 'Recent Orders' : `Orders (${periodLabel})`}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-[10px] font-bold text-gray-400 uppercase">Order</th>
                <th className="text-left py-2 text-[10px] font-bold text-gray-400 uppercase">Customer</th>
                <th className="text-right py-2 text-[10px] font-bold text-gray-400 uppercase">Amount</th>
                <th className="text-right py-2 text-[10px] font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5">
                    <span className="font-bold text-gray-900 text-xs">#{order.orderId}</span>
                  </td>
                  <td className="py-2.5">
                    <span className="text-gray-600 text-xs">{order.customerName}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="font-bold text-gray-900 text-xs">₹{order.totalAmount}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.orderStatus === 'completed' ? 'bg-green-100 text-green-700' :
                      order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.orderStatus === 'preparing' ? 'bg-orange-100 text-orange-700' :
                      order.orderStatus === 'out-for-delivery' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    No orders found for this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
