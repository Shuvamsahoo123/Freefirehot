import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Page title mapping
const pageTitles = {
  '/': 'FreeFire Hotel',
  '/dashboard': 'FreeFire Hotel',
  '/orders': 'Orders',
  '/menu': 'Menu & Inventory',
  '/menu/add': 'Add Food Item',
  '/payments': 'Payments',
  '/dinein': 'Dine-In',
  '/reviews': 'Customer Reviews',
  '/notifications': 'Notifications',
  '/messages': 'Messages',
  '/more': 'More',
  '/settings': 'Settings',
};

// Pages that show back button instead of logo
const pagesWithBack = ['/menu/add', '/reviews', '/notifications', '/messages', '/settings', '/reports'];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadNotificationCount } = useApp();

  const currentPath = location.pathname;
  const isOrderDetail = currentPath.startsWith('/orders/');
  const isMenuEdit = currentPath.startsWith('/menu/edit/');
  const isHomePage = currentPath === '/' || currentPath === '/dashboard';

  const showBackButton = pagesWithBack.includes(currentPath) || isOrderDetail || isMenuEdit;

  let title = pageTitles[currentPath] || 'FreeFire Hotel';
  if (isOrderDetail) title = 'Order Details';
  if (isMenuEdit) title = 'Edit Food Item';

  return (
    <header className="bg-dark sticky top-0 z-40 safe-top shadow-lg" style={{ boxShadow: '0 4px 20px -4px rgba(0,0,0,0.3)' }}>
      <div className="flex items-center justify-between px-4 py-3 lg:py-4 max-w-3xl mx-auto lg:max-w-none">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-white hover:text-primary-300 transition-colors touch-active"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}

          {isHomePage ? (
            <div className="flex items-center gap-2.5">
              {/* FreeFire Hotel logo */}
              <img src="/images/logo.jpg" alt="FreeFire Hotel" className="w-9 h-9 rounded-lg object-cover shadow-md ring-2 ring-white/10" width="36" height="36" decoding="async" />
              <h1 className="text-white font-bold text-lg tracking-tight">
                {title}
              </h1>
            </div>
          ) : (
            <h1 className="text-white font-semibold text-[17px]">{title}</h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isOrderDetail && (
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-white hover:text-primary-300 transition-colors touch-active rounded-lg"
              aria-label="Notifications"
            >
              <Bell size={22} />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )}
          {isOrderDetail && (
            <button
              className="p-2 text-white hover:text-primary-300 transition-colors touch-active rounded-lg"
              aria-label="More options"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
