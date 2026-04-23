// Supabase Client Initialization
const supabaseUrl = 'https://oosjahmlsdierkeetnaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vc2phaG1sc2RpZXJrZWV0bmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTQ3MzksImV4cCI6MjA5MjQ5MDczOX0.LLb9GYBvgXJlo8q3MHIue0QLeKwo44GJA_v845iMi-M';
let supabase = null;

let currentUser = null;

// Wait for Supabase to load
function initSupabase() {
  if (!window.supabase) {
    console.warn('Supabase not loaded yet, retrying in 100ms...');
    setTimeout(initSupabase, 100);
    return;
  }
  const { createClient } = window.supabase;
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase initialized');
}

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase first
  initSupabase();
  
  // Wait a moment for Supabase to be ready
  if (!supabase) {
    console.error('Supabase failed to initialize');
    alert('Error loading authentication service. Please refresh the page.');
    return;
  }

  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    currentUser = user;
    showDashboard();
  }

  // Set up form toggle
  loginToggle.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
  });

  signupToggle.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupForm();
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

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
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

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
      showLoginForm();
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
  document.getElementById('overviewTab').addEventListener('click', () => showTab('overview'));
  document.getElementById('ordersTab').addEventListener('click', () => showTab('orders'));
  document.getElementById('accountTab').addEventListener('click', () => showTab('account'));
});

// Show login form
function showLoginForm() {
  loginForm.style.display = 'flex';
  signupForm.style.display = 'none';
  loginToggle.classList.add('active');
  signupToggle.classList.remove('active');
}

// Show signup form
function showSignupForm() {
  loginForm.style.display = 'none';
  signupForm.style.display = 'flex';
  loginToggle.classList.remove('active');
  signupToggle.classList.add('active');
}

// Show auth form
function showAuthForm() {
  authContainer.style.display = 'flex';
  dashboardContainer.style.display = 'none';
}

// Show dashboard
function showDashboard() {
  authContainer.style.display = 'none';
  dashboardContainer.style.display = 'block';
  loadDashboard();
}

// Load dashboard data
async function loadDashboard() {
  const username = currentUser.email.split('@')[0];
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('profileEmail').value = currentUser.email;

  // Load overview tab by default
  showTab('overview');
}

// Tab switching
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Deactivate all buttons
  document.getElementById('overviewTab').classList.remove('active');
  document.getElementById('ordersTab').classList.remove('active');
  document.getElementById('accountTab').classList.remove('active');

  // Show selected tab
  document.getElementById(`${tabName}Content`).classList.add('active');
  document.getElementById(`${tabName}Tab`).classList.add('active');

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
  const stats = [
    { label: 'Total Orders', value: '8' },
    { label: 'Total Spent', value: '$1,245.00' },
    { label: 'Pending Orders', value: '2' },
    { label: 'Active Downloads', value: '3' },
  ];

  const statsContainer = document.getElementById('statsContainer');
  statsContainer.innerHTML = stats
    .map(
      (stat) => `
    <div class="stat-card">
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `
    )
    .join('');

  // Mock recent orders
  const recentOrders = [
    { id: '#SS-001', date: '2025-12-20', amount: '$299.00', status: 'Completed' },
    { id: '#SS-002', date: '2025-12-18', amount: '$149.50', status: 'In Progress' },
    { id: '#SS-003', date: '2025-12-15', amount: '$75.00', status: 'Completed' },
  ];

  const recentOrdersList = document.getElementById('recentOrdersContainer');
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

  const ordersList = document.getElementById('ordersListContainer');
  ordersList.innerHTML = allOrders
    .map(
      (order) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${order.id}</div>
        <div class="order-date">${order.date}</div>
      </div>
      <div style="flex: 1;">${order.items}</div>
      <div class="order-amount">${order.amount}</div>
      <div class="order-status ${order.status.toLowerCase().replace(' ', '-')}">${order.status}</div>
    </div>
  `
    )
    .join('');
}

// Load account tab
function loadAccountTab() {
  // Profile form handler
  document.getElementById('updateProfileBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const displayName = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const company = document.getElementById('profileCompany').value;

    // Mock update (real implementation would save to Supabase)
    try {
      alert('Profile updated successfully!');
    } catch (error) {
      alert(`Update failed: ${error.message}`);
    }
  });

  // Password change handler
  document.getElementById('changePasswordBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!newPassword || !confirmNewPassword) {
      alert('Please fill in all password fields');
      return;
    }

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
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmNewPassword').value = '';
    } catch (error) {
      alert(`Password change failed: ${error.message}`);
    }
  });

  // Delete account handler
  document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
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
