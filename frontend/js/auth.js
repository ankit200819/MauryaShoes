const Auth = {
  getToken: () => localStorage.getItem('ms_token'),
  getUser: () => { try { return JSON.parse(localStorage.getItem('ms_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('ms_token'),
  isAdmin: () => { const u = Auth.getUser(); return u && u.role === 'admin'; },

  save(token, user) {
    localStorage.setItem('ms_token', token);
    localStorage.setItem('ms_user', JSON.stringify(user));
    Auth.updateNav();
  },

  logout() {
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
    window.location.href = '/login.html';
  },

  updateNav() {
    const user = Auth.getUser();
    const loginBtn = document.getElementById('nav-login-btn');
    const userBtn = document.getElementById('nav-user-btn');
    const adminLink = document.getElementById('nav-admin-link');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userBtn) {
        userBtn.style.display = 'flex';
        userBtn.innerHTML = `<span>👤</span><span>${user.name.split(' ')[0]}</span>`;
        userBtn.onclick = () => window.location.href = '/profile.html';
      }
      if (adminLink) adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
    } else {
      if (loginBtn) loginBtn.style.display = 'flex';
      if (userBtn) userBtn.style.display = 'none';
      if (adminLink) adminLink.style.display = 'none';
    }
  },

  requireAuth() {
    if (!Auth.isLoggedIn()) { window.location.href = '/login.html'; return false; }
    return true;
  },

  requireAdmin() {
    if (!Auth.isAdmin()) { window.location.href = '/'; return false; }
    return true;
  }
};

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Cart badge update
async function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  if (!Auth.isLoggedIn()) { badge.textContent = '0'; return; }
  try {
    const items = await api.getCart();
    const count = items.reduce((s, i) => s + i.quantity, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  } catch {}
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNav();
  updateCartBadge();

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', Auth.logout);

  // Mobile hamburger
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('nav-open'));
  }
});

window.Auth = Auth;
window.updateCartBadge = updateCartBadge;
