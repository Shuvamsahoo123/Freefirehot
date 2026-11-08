import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Mail,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MoreMenu() {
  const navigate = useNavigate();
  const { logout, unreadNotificationCount } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [

    {
      icon: BarChart3,
      label: 'Sales & Reports',
      description: 'View your performance data',
      path: '/reports',
      color: 'text-indigo-500',
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    },
    {
      icon: Star,
      label: 'Customer Reviews',
      description: 'Manage & verify reviews',
      path: '/reviews',
      color: 'text-yellow-500',
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    },
    {
      icon: Mail,
      label: 'Messages',
      description: 'Customer messages',
      path: '/messages',
      color: 'text-teal-500',
      bg: 'bg-gradient-to-br from-teal-50 to-teal-100',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Stay updated',
      path: '/notifications',
      color: 'text-blue-500',
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Store hours, UPI & more',
      path: '/settings',
      color: 'text-gray-500',
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
    },
  ];

  return (
    <div className="px-4 py-5 animate-fade-in">
      <h2 className="text-lg font-bold text-gray-900 mb-5">More</h2>

      {/* Menu list */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden mb-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50/80 transition-all duration-200 touch-active text-left group ${
                index < menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div
                className={`w-11 h-11 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow duration-200`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-gray-800">
                  {item.label}
                </span>
                <span className="block text-xs text-gray-400 font-medium mt-0.5">
                  {item.description}
                </span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-sm">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-card border border-gray-100/80 hover:bg-red-50 hover:border-red-100/80 hover:shadow-glow-red transition-all duration-300 touch-active group"
      >
        <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
          <LogOut size={18} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-red-500">Logout</span>
      </button>
    </div>
  );
}
