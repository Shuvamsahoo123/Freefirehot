import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CheckCircle,
  CreditCard,
  UtensilsCrossed,
  Truck,
  Package,
  AlertCircle,
  ChefHat,
  Users,
  AlertTriangle,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ShopAvailabilityCard from '../components/ShopAvailabilityCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboardStats, orders, dineInBookings, menuItems } = useApp();

  const statCards = [
    {
      label: 'Total Orders',
      value: dashboardStats.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-500',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      shadow: 'hover:shadow-glow-blue',
      accent: 'accent-blue',
    },
    {
      label: 'Pending Payments',
      value: dashboardStats.pendingPayments,
      icon: CreditCard,
      color: 'text-red-500',
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      shadow: 'hover:shadow-glow-red',
      accent: 'accent-red',
    },
    {
      label: 'Delivery Orders',
      value: dashboardStats.deliveryOrders,
      icon: Truck,
      color: 'text-indigo-500',
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      shadow: 'hover:shadow-glow-indigo',
      accent: 'accent-indigo',
    },
  ];

  const urgentActions = [];

  if (dashboardStats.pendingPayments > 0) {
    urgentActions.push({
      icon: AlertCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-gradient-to-r from-red-50 to-red-100/60',
      borderColor: 'border-red-200/60',
      label: `${dashboardStats.pendingPayments} payment${dashboardStats.pendingPayments > 1 ? 's' : ''} waiting for verification`,
      path: '/payments',
    });
  }


  if (dashboardStats.lowStockItems > 0) {
    urgentActions.push({
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-gradient-to-r from-yellow-50 to-yellow-100/60',
      borderColor: 'border-yellow-200/60',
      label: `Low food quantity (${dashboardStats.lowStockItems} item${dashboardStats.lowStockItems > 1 ? 's' : ''})`,
      path: '/menu',
    });
  }

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Hero Banner */}
      <div className="mb-5 px-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <Flame size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Today's Overview
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Shop Availability */}
      <ShopAvailabilityCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5 stagger-children">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 shadow-card border border-gray-100/60 flex flex-col items-center text-center cursor-default hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`w-11 h-11 ${stat.iconBg} rounded-xl flex items-center justify-center shadow-sm mb-3`}
              >
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">{stat.value}</p>
              <p className="text-[9px] text-gray-400 font-semibold mt-1.5 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Urgent Actions
          </h3>
          <div className="space-y-2.5 stagger-children">
            {urgentActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 ${action.bgColor} border ${action.borderColor} rounded-2xl hover:shadow-card-hover hover-lift transition-all duration-200 touch-active text-left group`}
                >
                  <div className="w-9 h-9 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon size={18} className={action.iconColor} />
                  </div>
                  <span className="flex-1 text-sm font-semibold text-gray-700">
                    {action.label}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
