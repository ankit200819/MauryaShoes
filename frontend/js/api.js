const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';

const api = {
  async request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('ms_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
      method, headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // Auth
  register: (d) => api.request('/auth/register', { method: 'POST', body: d }),
  login: (d) => api.request('/auth/login', { method: 'POST', body: d }),
  getProfile: () => api.request('/auth/profile', { auth: true }),
  updateProfile: (d) => api.request('/auth/profile', { method: 'PUT', body: d, auth: true }),

  // Products
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.request(`/products?${qs}`);
  },
  getProduct: (id) => api.request(`/products/${id}`),
  getFilters: () => api.request('/products/filters'),
  addReview: (id, d) => api.request(`/products/${id}/reviews`, { method: 'POST', body: d, auth: true }),

  // Cart
  getCart: () => api.request('/cart', { auth: true }),
  addToCart: (d) => api.request('/cart', { method: 'POST', body: d, auth: true }),
  updateCart: (id, d) => api.request(`/cart/${id}`, { method: 'PUT', body: d, auth: true }),
  removeFromCart: (id) => api.request(`/cart/${id}`, { method: 'DELETE', auth: true }),
  clearCart: () => api.request('/cart', { method: 'DELETE', auth: true }),

  // Orders
  createOrder: (d) => api.request('/orders', { method: 'POST', body: d, auth: true }),
  getOrders: () => api.request('/orders', { auth: true }),
  getOrder: (id) => api.request(`/orders/${id}`, { auth: true }),
  cancelOrder: (id) => api.request(`/orders/${id}/cancel`, { method: 'PUT', auth: true }),

  // Admin
  getAdminStats: () => api.request('/admin/stats', { auth: true }),
  getAdminProducts: () => api.request('/admin/products', { auth: true }),
  createProduct: (d) => api.request('/admin/products', { method: 'POST', body: d, auth: true }),
  updateProduct: (id, d) => api.request(`/admin/products/${id}`, { method: 'PUT', body: d, auth: true }),
  deleteProduct: (id) => api.request(`/admin/products/${id}`, { method: 'DELETE', auth: true }),
  getAdminOrders: () => api.request('/admin/orders', { auth: true }),
  updateOrderStatus: (id, status) => api.request(`/admin/orders/${id}`, { method: 'PUT', body: { status }, auth: true }),
  getAdminUsers: () => api.request('/admin/users', { auth: true }),
};

// Toast utility
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: '💡', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'💡'}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'fadeOutRight 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// Format currency
function formatPrice(n) { return `₹${Number(n).toLocaleString('en-IN')}`; }

// Stars
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let s = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  return s;
}

// Discount %
function discountPct(price, original) { return Math.round((1 - price / original) * 100); }

window.api = api;
window.showToast = showToast;
window.formatPrice = formatPrice;
window.renderStars = renderStars;
window.discountPct = discountPct;
