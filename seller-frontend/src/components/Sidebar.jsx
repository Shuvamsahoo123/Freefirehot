import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Grid3X3,
  CreditCard,
  UtensilsCrossed,
  Bell,
  Settings,
  LogOut,
  Mail,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const sidebarItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/menu', label: 'Menu & Inventory', icon: Grid3X3 },

  { path: '/reviews', label: 'Reviews', icon: Star },
  { path: '/messages', label: 'Messages', icon: Mail },
  { path: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, unreadNotificationCount } = useApp();

  const getIsActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/orders') return location.pathname.startsWith('/orders');
    if (path === '/menu') return location.pathname.startsWith('/menu');
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark flex flex-col z-50 overflow-y-auto" style={{ boxShadow: '4px 0 24px -4px rgba(0,0,0,0.4)' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-dark-lighter">
        <div className="flex items-center gap-3">
          <img src="/images/logo.jpg" alt="FreeFire Hotel" className="w-11 h-11 rounded-xl object-cover shadow-lg ring-2 ring-white/10" width="44" height="44" decoding="async" />
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">FreeFire Hotel</h1>
            <p className="text-gray-400 text-xs">Seller Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.path);
          const showBadge = item.path === '/notifications' && unreadNotificationCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 shadow-glow-orange'
                  : 'text-gray-400 hover:bg-dark-lighter hover:text-gray-200'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 2}
                className="flex-shrink-0"
              />
              <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {showBadge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadNotificationCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-dark-lighter space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-dark-lighter hover:text-gray-200 transition-all duration-200"
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
