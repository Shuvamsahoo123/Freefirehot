import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { fetchMenuItems, createMenuItem as createMenuItemAPI, updateMenuItemAPI, deleteMenuItemAPI, fetchStoreSettings, updateStoreSettingsAPI, fetchAllOrders, verifyPaymentAPI, rejectPaymentAPI, updateOrderStatusAPI, rejectOrderAPI, collectRemainingPaymentAPI, loginSellerAPI, setupSellerAPI, fetchCurrentSellerAPI } from '../services/api';
import {
  initialOrders,
  initialMenuItems,
  initialDineInBookings,
  initialNotifications,
  initialStoreSettings,
} from '../data/mockData';

const AppContext = createContext(null);

const getMenuItemId = (item) => item?._id ?? item?.id;
const normalizeMenuItem = (item) => {
  const id = getMenuItemId(item);
  return id == null ? item : { ...item, id: String(id) };
};

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [dineInBookings, setDineInBookings] = useState(initialDineInBookings);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [storeSettings, setStoreSettings] = useState(initialStoreSettings);
  const hasLoadedOrdersRef = useRef(false);
  const seenOrderIdsRef = useRef(new Set());

  // ========== AUTH ==========
  useEffect(() => {
    async function restoreSession() {
      if (window.sessionStorage.getItem('sellerToken')) {
        try {
          await fetchCurrentSellerAPI();
          setIsAuthenticated(true);
        } catch {
          window.sessionStorage.removeItem('sellerToken');
        }
      }
      setAuthReady(true);
    }
    restoreSession();
  }, []);

  const login = useCallback(async (email, password, setup = false) => {
    const session = setup
      ? await setupSellerAPI(email, password)
      : await loginSellerAPI(email, password);
    window.sessionStorage.setItem('sellerToken', session.token);
    setIsAuthenticated(true);
    return session.seller;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem('sellerToken');
    setIsAuthenticated(false);
  }, []);

  // ========== ORDERS ==========
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatusAPI(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId || order._id === orderId ? result.data : order
        )
      );
      if (newStatus === 'completed') {
        try {
          setMenuItems(await fetchMenuItems());
        } catch (refreshError) {
          console.error('Order completed, but menu inventory could not be refreshed:', refreshError);
        }
      }
      // Add notification
      const order = orders.find((o) => o.id === orderId || o._id === orderId);
      if (order) {
        addNotification({
          type: 'order_ready',
          title: `Order ${newStatus === 'ready' ? 'Ready' : 'Updated'}`,
          message: `Order #${order.orderId} status changed to ${newStatus}`,
          time: 'Just now',
          icon: 'CheckCircle',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
        });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }, [orders]);

  const updatePaymentStatus = useCallback(async (orderId, newStatus) => {
    try {
      if (newStatus === 'confirmed' || newStatus === 'verified') {
        const result = await verifyPaymentAPI(orderId);
        setOrders((prev) => prev.map((o) => (o._id === orderId || o.id === orderId ? result.data : o)));
      } else if (newStatus === 'rejected') {
        const result = await rejectPaymentAPI(orderId, 'Seller rejected payment');
        setOrders((prev) => prev.map((o) => (o._id === orderId || o.id === orderId ? result.data : o)));
      } else {
        // Optimistic local update for other statuses
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId || order._id === orderId
              ? {
                  ...order,
                  paymentStatus: newStatus,
                  paymentVerifiedAt: newStatus === 'confirmed' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : order.paymentVerifiedAt,
                }
              : order
          )
        );
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  }, []);

  const rejectOrder = useCallback(async (orderId, reason) => {
    try {
      const result = await rejectOrderAPI(orderId, reason);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId || order._id === orderId ? result.data : order
        )
      );
      const order = orders.find((o) => o.id === orderId || o._id === orderId);
      if (order) {
        addNotification({
          type: 'order_cancelled',
          title: 'Order Rejected',
          message: `Order #${order.orderId} was rejected: ${reason}`,
          time: 'Just now',
          icon: 'XCircle',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
        });
      }
    } catch (error) {
      console.error('Failed to reject order:', error);
    }
  }, [orders]);

  const collectRemainingPayment = useCallback(async (orderId) => {
    try {
      const result = await collectRemainingPaymentAPI(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId || order._id === orderId ? result.data : order
        )
      );
    } catch (error) {
      console.error('Failed to collect remaining payment:', error);
    }
  }, []);

  // ========== ORDERS INIT / LIVE REFRESH ==========
  const refreshOrders = useCallback(async () => {
    try {
      const data = await fetchAllOrders();
      const latestOrders = data || [];
      const currentIds = new Set(latestOrders.map((order) => String(order._id || order.id)).filter(Boolean));

      if (hasLoadedOrdersRef.current && 'Notification' in window && Notification.permission === 'granted') {
        const newOrders = latestOrders.filter((order) => {
          const id = String(order._id || order.id || '');
          return id && !seenOrderIdsRef.current.has(id);
        });

        newOrders.forEach((order) => {
          const title = 'New order received';
          const orderNumber = order.orderId || order._id || order.id;
          const body = `Order #${orderNumber} is waiting for your review.`;
          const options = {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            tag: `new-order-${order._id || order.id}`,
            data: { url: `/orders/${order._id || order.id}` },
          };

          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready
              .then((registration) => registration.showNotification(title, options))
              .catch((error) => console.error('Could not show order notification:', error));
          } else {
            new Notification(title, options);
          }
        });
      }

      seenOrderIdsRef.current = currentIds;
      hasLoadedOrdersRef.current = true;
      setOrders(latestOrders);
    } catch (err) {
      // Keep the last successfully loaded orders visible during temporary outages.
      console.error('Failed to refresh orders:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    refreshOrders();

    // Refresh new orders while the seller panel is open, and catch up when
    // the seller returns to the tab. This works without a WebSocket service.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshOrders();
    }, 10000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshOrders();
    };
    const handleFocus = () => refreshOrders();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, refreshOrders]);

  // ========== MENU ==========
  // Fetch initial menu items from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenuItems();
        setMenuItems((data || []).map(normalizeMenuItem));
      } catch (err) {
        console.error("Failed to load menu items", err);
      }
    }
    if (isAuthenticated) loadMenu();
  }, [isAuthenticated]);

  const addMenuItem = useCallback(async (item) => {
    try {
      const savedItem = await createMenuItemAPI(item);
      const normalizedItem = normalizeMenuItem(savedItem);
      setMenuItems((prev) => [normalizedItem, ...prev]);
      return normalizedItem;
    } catch (err) {
      console.error("Failed to create menu item", err);
      throw err;
    }
  }, []);

  const updateMenuItem = useCallback(async (itemId, updates) => {
    try {
      const itemToUpdate = menuItems.find((item) => String(getMenuItemId(item)) === String(itemId));
      if (!itemToUpdate) throw new Error('Menu item not found. Refresh the page and try again.');
      const dbId = getMenuItemId(itemToUpdate);
      const updatedItem = normalizeMenuItem(await updateMenuItemAPI(dbId, updates));
      
      setMenuItems((prev) =>
        prev.map((item) => String(getMenuItemId(item)) === String(dbId) ? updatedItem : item)
      );
    } catch (err) {
      console.error("Failed to update menu item", err);
      throw err;
    }
  }, [menuItems]);

  const deleteMenuItem = useCallback(async (itemId) => {
    try {
      const itemToDelete = menuItems.find((item) => String(getMenuItemId(item)) === String(itemId));
      if (!itemToDelete) throw new Error('Menu item not found. Refresh the page and try again.');
      const dbId = getMenuItemId(itemToDelete);
      await deleteMenuItemAPI(dbId);
      
      setMenuItems((prev) => prev.filter((item) => String(getMenuItemId(item)) !== String(dbId)));
    } catch (err) {
      console.error("Failed to delete menu item", err);
      throw err;
    }
  }, [menuItems]);

  const restockMenuItem = useCallback(async (itemId, newQty) => {
    try {
      await updateMenuItem(itemId, { dailyQty: newQty });
    } catch (err) {
      console.error("Failed to restock menu item", err);
      throw err;
    }
  }, [updateMenuItem]);

  // ========== DINE-IN ==========
  const updateDineInBooking = useCallback((bookingId, updates) => {
    setDineInBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      )
    );
  }, []);

  // ========== NOTIFICATIONS ==========
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { ...notification, id: Date.now(), read: false },
      ...prev,
    ]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  // ========== STORE SETTINGS ==========
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await fetchStoreSettings();
        setStoreSettings(data);
      } catch (err) {
        console.error("Failed to load store settings", err);
      }
    }
    if (isAuthenticated) loadSettings();
  }, [isAuthenticated]);

  const updateStoreSettings = useCallback(async (updates) => {
    try {
      const newSettings = await updateStoreSettingsAPI(updates);
      setStoreSettings(newSettings);
      return newSettings;
    } catch (err) {
      console.error("Failed to update store settings", err);
      throw err;
    }
  }, []);

  // ========== COMPUTED VALUES ==========
  const dashboardStats = {
    totalOrders: orders.length,
    confirmedOrders: orders.filter((o) => o.paymentStatus === 'verified').length,
    pendingPayments: orders.filter((o) => o.paymentStatus === 'verification_pending').length,
    deliveryOrders: orders.filter((o) => o.orderType === 'Delivery').length,
    dineInBookings: dineInBookings.filter((b) => b.bookingStatus !== 'completed' && b.bookingStatus !== 'cancelled').length,
    remainingFood: menuItems.reduce((sum, item) => sum + item.remaining, 0),
    ordersNeedPreparation: orders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'confirmed').length,
    lowStockItems: menuItems.filter((item) => item.remaining > 0 && item.remaining <= 10).length,
  };

  // ========== REPORTS COMPUTED ==========
  const reportStats = useMemo(() => {
    const totalSales = orders
      .filter((o) => o.paymentStatus === 'verified')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const advanceReceived = orders
      .filter((o) => o.paymentStatus === 'verified')
      .reduce((sum, o) => sum + o.advanceAmount, 0);

    const remainingDue = orders
      .filter((o) => o.paymentStatus === 'verified' && o.remainingAmount > 0)
      .reduce((sum, o) => sum + o.remainingAmount, 0);

    const cancelledOrders = orders.filter(
      (o) => o.orderStatus === 'cancelled'
    ).length;

    const completedOrders = orders.filter(
      (o) => o.orderStatus === 'completed'
    ).length;

    // Item sales count
    const itemSales = {};
    orders
      .filter((o) => o.paymentStatus === 'verified')
      .forEach((o) => {
        o.items.forEach((item) => {
          if (!itemSales[item.name]) {
            itemSales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
          }
          itemSales[item.name].quantity += item.quantity;
          itemSales[item.name].revenue += item.quantity * item.price;
        });
      });
    const topItems = Object.values(itemSales).sort(
      (a, b) => b.quantity - a.quantity
    );

    // Order type split
    const orderTypeSplit = {
      Delivery: orders.filter((o) => o.orderType === 'Delivery').length,
      Pickup: orders.filter((o) => o.orderType === 'Pickup').length,
      'Dine-In': orders.filter((o) => o.orderType === 'Dine-In').length,
    };

    return {
      totalSales,
      advanceReceived,
      remainingDue,
      cancelledOrders,
      completedOrders,
      topItems,
      orderTypeSplit,
      totalOrders: orders.length,
    };
  }, [orders]);

  const value = {
    // Auth
    isAuthenticated,
    authReady,
    login,
    logout,
    // Orders
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    rejectOrder,
    collectRemainingPayment,
    // Menu
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    restockMenuItem,
    // Dine-in
    dineInBookings,
    updateDineInBooking,
    // Notifications
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
    // Store Settings
    storeSettings,
    updateStoreSettings,
    // Dashboard
    dashboardStats,
    // Reports
    reportStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
