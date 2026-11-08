import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { useApp } from './context/AppContext';

// ========== LAZY-LOADED PAGES ==========
// Each page is loaded on-demand, splitting the JS bundle
// so the initial load only includes the Login or Dashboard page.
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const MenuInventory = lazy(() => import('./pages/MenuInventory'));
const AddFoodItem = lazy(() => import('./pages/AddFoodItem'));
const EditFoodItem = lazy(() => import('./pages/EditFoodItem'));

const Messages = lazy(() => import('./pages/Messages'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Notifications = lazy(() => import('./pages/Notifications'));
const MoreMenu = lazy(() => import('./pages/MoreMenu'));
const Settings = lazy(() => import('./pages/Settings'));
const Reports = lazy(() => import('./pages/Reports'));

// Lightweight fallback shown while a page chunk loads
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-xs font-medium text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useApp();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Login route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />

        {/* Protected routes inside Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/menu" element={<MenuInventory />} />
          <Route path="/menu/add" element={<AddFoodItem />} />
          <Route path="/menu/edit/:id" element={<EditFoodItem />} />


          <Route path="/messages" element={<Messages />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/more" element={<MoreMenu />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* Default redirect */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
          }
        />
      </Routes>
    </Suspense>
  );
}
