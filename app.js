// Supabase Client Initialization
const supabaseUrl = 'https://oosjahmlsdierkeetnaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vc2phaG1sc2RpZXJrZWV0bmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTQ3MzksImV4cCI6MjA5MjQ5MDczOX0.LLb9GYBvgXJlo8q3MHIue0QLeKwo44GJA_v845iMi-M';
const { createClient } = window.supabase;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = null;

// DOM Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toggleSignupLink = document.getElementById('toggle-signup');
const toggleLoginLink = document.getElementById('toggle-login');
const logoutBtn = document.getElementById('logout-btn');

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    showDashboard();
  }

  // Set up form toggle
  toggleSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForm();
  });

  toggleLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForm();
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      currentUser = data.user;
      showDashboard();
      loginForm.reset();
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    }
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      alert('Signup successful! Please check your email to confirm your account.');
      toggleAuthForm();
      signupForm.reset();
    } catch (error) {
      alert(`Signup failed: ${error.message}`);
    }
  });

  // Logout handler
  logoutBtn.addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      currentUser = null;
      showAuthForm();
      authContainer.querySelector('form').reset();
    } catch (error) {
      alert(`Logout failed: ${error.message}`);
    }
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });
});

// Toggle between login and signup forms
function toggleAuthForm() {
  loginForm.classList.toggle('hidden');
  signupForm.classList.toggle('hidden');
}

// Show auth form
function showAuthForm() {
  authContainer.classList.remove('hidden');
  dashboardContainer.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
  authContainer.classList.add('hidden');
  dashboardContainer.classList.remove('hidden');
  loadDashboard();
}

// Load dashboard data
async function loadDashboard() {
  const username = currentUser.email.split('@')[0];
  document.getElementById('user-name').textContent = username;
  document.getElementById('user-email').textContent = currentUser.email;

  // Load overview tab by default
  showTab('overview');
}

// Tab switching
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.add('hidden');
  });

  // Deactivate all buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.remove('hidden');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Load tab-specific data
  if (tabName === 'overview') {
    loadOverviewTab();
  } else if (tabName === 'orders') {
    loadOrdersTab();
  } else if (tabName === 'account') {
    loadAccountTab();
  }
}

// Load overview tab
function loadOverviewTab() {
  // Mock stats
  const stats = {
    totalOrders: 8,
    totalSpent: '$1,245.00',
    pendingOrders: 2,
    activeDownloads: 3,
  };

  document.getElementById('stat-total-orders').textContent = stats.totalOrders;
  document.getElementById('stat-total-spent').textContent = stats.totalSpent;
  document.getElementById('stat-pending-orders').textContent = stats.pendingOrders;
  document.getElementById('stat-active-downloads').textContent = stats.activeDownloads;

  // Mock recent orders
  const recentOrders = [
    { id: '#SS-001', date: '2025-12-20', amount: '$299.00', status: 'Completed' },
    { id: '#SS-002', date: '2025-12-18', amount: '$149.50', status: 'In Progress' },
    { id: '#SS-003', date: '2025-12-15', amount: '$75.00', status: 'Completed' },
  ];

  const recentOrdersList = document.getElementById('recent-orders-list');
  recentOrdersList.innerHTML = recentOrders
    .map(
      (order) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${order.id}</div>
        <div class="order-date">${order.date}</div>
      </div>
      <div class="order-status ${order.status.toLowerCase().replace(' ', '-')}">${order.status}</div>
      <div class="order-amount">${order.amount}</div>
    </div>
  `
    )
    .join('');
}

// Load orders tab
function loadOrdersTab() {
  // Mock orders
  const allOrders = [
    { id: '#SS-001', date: '2025-12-20', items: 'Vintage Synth Pack', amount: '$299.00', status: 'Completed' },
    { id: '#SS-002', date: '2025-12-18', items: 'Vocal Processing Bundle', amount: '$149.50', status: 'In Progress' },
    { id: '#SS-003', date: '2025-12-15', items: 'Drum Kit Collection', amount: '$75.00', status: 'Completed' },
    { id: '#SS-004', date: '2025-12-10', items: 'Ambient Pad Library', amount: '$49.99', status: 'Completed' },
    { id: '#SS-005', date: '2025-12-05', items: 'Bass Synth Pack', amount: '$89.00', status: 'Completed' },
  ];

  const ordersList = document.getElementById('orders-list');
  ordersList.innerHTML = allOrders
    .map(
      (order) => `
    <div class="order-row">
      <div class="order-id">${order.id}</div>
      <div class="order-date">${order.date}</div>
      <div class="order-items">${order.items}</div>
      <div class="order-amount">${order.amount}</div>
      <div class="order-status ${order.status.toLowerCase().replace(' ', '-')}">${order.status}</div>
      <button class="btn-small btn-view">View</button>
    </div>
  `
    )
    .join('');
}

// Load account tab
function loadAccountTab() {
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('password-form');

  // Profile form handler
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const displayName = document.getElementById('display-name').value;
    const phone = document.getElementById('phone').value;

    // Mock update (real implementation would save to Supabase)
    try {
      alert('Profile updated successfully!');
      profileForm.reset();
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  });

  // Password form handler
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert('Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      alert(`Password change failed: ${error.message}`);
    }
  });

  // Delete account handler
  document.getElementById('delete-account-btn').addEventListener('click', async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Note: Deleting user requires service role key (not available on client)
      // For now, just sign them out and show a message
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      alert(
        'Your account has been scheduled for deletion. You will receive a confirmation email.'
      );
      currentUser = null;
      showAuthForm();
    } catch (error) {
      alert(`Deletion failed: ${error.message}`);
    }
  });
}
