import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import { useApp } from '../context/AppContext';

export default function Layout() {
  const { isAuthenticated, authReady } = useApp();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Checking seller session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - visible on lg+ */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Page content with bottom padding for mobile nav */}
        <main className="flex-1 pb-20 lg:pb-6">
          <div className="max-w-3xl mx-auto lg:max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - hidden on lg+ */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
