import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Grid3X3, UtensilsCrossed, MoreHorizontal } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/menu', label: 'Menu', icon: Grid3X3 },
  { path: '/more', label: 'More', icon: MoreHorizontal },
];

export default function BottomNavigation() {
  const location = useLocation();

  // Don't show on login page
  if (location.pathname === '/login' || location.pathname === '/') return null;

  // Determine active nav item
  const getIsActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/orders') return location.pathname.startsWith('/orders');
    if (path === '/menu') return location.pathname.startsWith('/menu');
    if (path === '/more') {
      return ['/more', '/messages', '/notifications', '/settings', '/reports'].includes(location.pathname);
    }
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/60 z-50 safe-bottom lg:hidden" style={{ boxShadow: '0 -4px 20px -4px rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[60px] touch-active relative"
            >
              {isActive && (
                <span className="absolute -top-1.5 w-5 h-1 bg-primary-500 rounded-full" />
              )}
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
