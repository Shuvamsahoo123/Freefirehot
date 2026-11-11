// =============================================
// Seller API Service - FreeFire Hotel
// =============================================
// Centralised API layer for communicating with the Seller Backend.
// All Cloudinary interactions go through the backend — never from the browser.

VITE_API_URL=https://freefirehot-mvcu.vercel.app

function getAuthHeaders() {
  const token = window.sessionStorage.getItem('sellerToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Generic fetch wrapper with error handling.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Network errors (fetch throws TypeError for network failures)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const networkError = new Error(
        'Unable to connect to the server. Please check your internet connection.'
      );
      networkError.status = 0;
      throw networkError;
    }
    throw error;
  }
}

export async function loginSellerAPI(email, password) {
  const result = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result.data;
}

export async function setupSellerAPI(email, password) {
  const result = await apiFetch('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result.data;
}

export async function fetchCurrentSellerAPI() {
  const result = await apiFetch('/auth/me');
  return result.data.seller;
}

export async function fetchSellerSetupStatusAPI() {
  const result = await apiFetch('/auth/setup-status');
  return result.data.setupRequired;
}

// ========== MENU ITEM IMAGE API ==========

/**
 * Upload a menu item image to Cloudinary via the Seller Backend.
 * @param {File} imageFile - The image file to upload
 * @param {function} onProgress - Optional progress callback (not supported by fetch, used for UI state)
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadMenuItemImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const result = await apiFetch('/menu-items/upload-image', {
    method: 'POST',
    body: formData,
  });

  return result.data.image;
}

// ========== MENU ITEM CRUD API ==========

/**
 * Get all menu items.
 */
export async function fetchMenuItems() {
  const result = await apiFetch('/menu-items');
  return result.data;
}

/**
 * Get a single menu item by ID.
 */
export async function fetchMenuItem(id) {
  const result = await apiFetch(`/menu-items/${id}`);
  return result.data;
}

/**
 * Create a new menu item.
 */
export async function createMenuItem(itemData) {
  const result = await apiFetch('/menu-items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
  return result.data;
}

/**
 * Update a menu item.
 */
export async function updateMenuItemAPI(id, itemData) {
  const result = await apiFetch(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  });
  return result.data;
}

/**
 * Remove image from a menu item.
 */
export async function removeMenuItemImageAPI(id) {
  const result = await apiFetch(`/menu-items/${id}/image`, {
    method: 'DELETE',
  });
  return result.data;
}

/**
 * Delete a menu item.
 */
export async function deleteMenuItemAPI(id) {
  const result = await apiFetch(`/menu-items/${id}`, {
    method: 'DELETE',
  });
  return result;
}

// ========== STORE SETTINGS API ==========

export async function fetchStoreSettings() {
  const result = await apiFetch('/store-settings');
  return result.data;
}

export async function updateStoreSettingsAPI(settings) {
  const result = await apiFetch('/store-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return result.data;
}

export async function uploadQrCodeAPI(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const result = await apiFetch('/store-settings/upload-qr', {
    method: 'POST',
    body: formData,
  });

  return result.data.image;
}

// ========== ORDERS API ==========

export async function fetchPendingPayments() {
  const result = await apiFetch('/orders/pending-payments');
  return result.data;
}

export async function fetchAllOrders() {
  const result = await apiFetch('/orders');
  return result.data;
}

export async function fetchOrderDetails(id) {
  const result = await apiFetch(`/orders/${id}`);
  return result.data;
}

export async function verifyPaymentAPI(id) {
  const result = await apiFetch(`/orders/${id}/verify`, {
    method: 'PUT',
  });
  return result;
}

export async function rejectPaymentAPI(id, reason) {
  const result = await apiFetch(`/orders/${id}/reject-payment`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
  return result;
}

export async function updateOrderStatusAPI(id, status) {
  const result = await apiFetch(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  return result;
}

export async function rejectOrderAPI(id, reason) {
  const result = await apiFetch(`/orders/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  });
  return result;
}

export async function collectRemainingPaymentAPI(id) {
  const result = await apiFetch(`/orders/${id}/collect`, {
    method: 'PUT',
  });
  return result;
}

// =============================================
// Notifications API
// =============================================
export async function getNotificationsAPI() {
  return await apiFetch('/notifications');
}

export async function createNotificationAPI(data) {
  return await apiFetch('/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateNotificationAPI(id, data) {
  return await apiFetch(`/notifications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteNotificationAPI(id) {
  return await apiFetch(`/notifications/${id}`, {
    method: 'DELETE',
  });
}

export async function toggleNotificationStatusAPI(id, isActive) {
  return await apiFetch(`/notifications/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
}

// ========== CUSTOMER REVIEWS API ==========
export async function fetchReviewsAPI() {
  return apiFetch('/reviews');
}

export async function toggleReviewVerificationAPI(id) {
  return apiFetch(`/reviews/${id}/verify`, { method: 'PATCH' });
}

export async function deleteReviewAPI(id) {
  return apiFetch(`/reviews/${id}`, { method: 'DELETE' });
}

// ========== CUSTOMER MESSAGES API ==========
export async function fetchMessagesAPI() {
  return apiFetch('/messages');
}

export async function markMessageAsReadAPI(id) {
  return apiFetch(`/messages/${id}/read`, { method: 'PATCH' });
}

export async function deleteMessageAPI(id) {
  return apiFetch(`/messages/${id}`, { method: 'DELETE' });
}

