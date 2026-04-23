// Supabase Client Initialization
const SUPABASE_URL = 'https://oosjahmlsdierkeetnaq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vc2phaG1sc2RpZXJrZWV0bmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTQ3MzksImV4cCI6MjA5MjQ5MDczOX0.LLb9GYBvgXJlo8q3MHIue0QLeKwo44GJA_v845iMi-M';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginToggle = document.getElementById('loginToggle');
const signupToggle = document.getElementById('signupToggle');
const logoutBtn = document.getElementById('logoutBtn');

// Tab buttons
const overviewTab = document.getElementById('overviewTab');
const ordersTab = document.getElementById('ordersTab');
const accountTab = document.getElementById('accountTab');

// Tab content
const overviewContent = document.getElementById('overviewContent');
const ordersContent = document.getElementById('ordersContent');
const accountContent = document.getElementById('accountContent');

// Form elements
const updateProfileBtn = document.getElementById('updateProfileBtn');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// User state
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    currentUser = user;
    showDashboard();
    loadDashboard();
  } else {
    showAuthPage();
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      currentUser = session.user;
      showDashboard();
      loadDashboard();
    } else {
      currentUser = null;
      showAuthPage();
    }
  });
});

function setupEventListeners() {
  // Auth toggles
  loginToggle.addEventListener('click', () => {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  });
  
  signupToggle.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });
  
  // Auth forms
  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  
  // Logout
  logoutBtn.addEventListener('click', handleLogout);
  
  // Dashboard tabs
  overviewTab.addEventListener('click', () => showTab('overview'));
  ordersTab.addEventListener('click', () => showTab('orders'));
  accountTab.addEventListener('click', () => showTab('account'));
  
  // Account actions
  updateProfileBtn.addEventListener('click', handleUpdateProfile);
  changePasswordBtn.addEventListener('click', handleChangePassword);
  deleteAccountBtn.addEventListener('click', handleDeleteAccount);
}

// Auth Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    currentUser = data.user;
    showDashboard();
    loadDashboard();
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  if (!email || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    alert('Signup successful! Check your email to confirm your account.');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    document.getElementById('loginEmail').value = email;
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupConfirmPassword').value = '';
  } catch (error) {
    alert('Signup failed: ' + error.message);
  }
}

async function handleLogout() {
  try {
    await supabase.auth.signOut();
    currentUser = null;
    showAuthPage();
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
}

// UI Navigation
function showAuthPage() {
  authContainer.style.display = 'flex';
  dashboardContainer.style.display = 'none';
  loginForm.style.display = 'block';
  signupForm.style.display = 'none';
}

function showDashboard() {
  authContainer.style.display = 'none';
  dashboardContainer.style.display = 'grid';
  showTab('overview');
}

function showTab(tab) {
  // Hide all tabs
  overviewContent.style.display = 'none';
  ordersContent.style.display = 'none';
  accountContent.style.display = 'none';
  
  // Remove active class from all buttons
  overviewTab.classList.remove('active');
  ordersTab.classList.remove('active');
  accountTab.classList.remove('active');
  
  // Show selected tab
  if (tab === 'overview') {
    overviewContent.style.display = 'block';
    overviewTab.classList.add('active');
  } else if (tab === 'orders') {
    ordersContent.style.display = 'block';
    ordersTab.classList.add('active');
    loadOrders();
  } else if (tab === 'account') {
    accountContent.style.display = 'block';
    accountTab.classList.add('active');
    loadAccountSettings();
  }
}

// Dashboard Loading
async function loadDashboard() {
  // Load overview stats
  loadOverviewStats();
  
  // Load orders in background
  loadOrders();
}

function loadOverviewStats() {
  // Mock data for demo - will replace with real Supabase queries
  const statsContainer = document.getElementById('statsContainer');
  
  const stats = [
    { label: 'Total Orders', value: '12', icon: '📦' },
    { label: 'Total Spent', value: '$2,450', icon: '💰' },
    { label: 'Avg. Order Value', value: '$204.17', icon: '📊' },
    { label: 'Member Since', value: '180 days', icon: '📅' }
  ];
  
  statsContainer.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-icon">${stat.icon}</div>
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `).join('');
  
  // Recent orders preview
  loadRecentOrders();
}

function loadRecentOrders() {
  // Mock recent orders data
  const recentOrdersContainer = document.getElementById('recentOrdersContainer');
  
  const orders = [
    { id: '#SS-10045', date: '2025-04-20', product: 'Vintage Vinyl Collection', amount: '$450', status: 'Delivered' },
    { id: '#SS-10044', date: '2025-04-18', product: 'Analog Synth Presets', amount: '$75', status: 'Delivered' },
    { id: '#SS-10043', date: '2025-04-15', product: 'Drum Kit Pro', amount: '$125', status: 'Processing' },
    { id: '#SS-10042', date: '2025-04-12', product: 'Mastering Bundle', amount: '$800', status: 'Delivered' }
  ];
  
  recentOrdersContainer.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Product</th>
          <th>Amount</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td class="order-id">${order.id}</td>
            <td>${order.date}</td>
            <td>${order.product}</td>
            <td>${order.amount}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadOrders() {
  // Mock orders data for full orders tab
  const ordersListContainer = document.getElementById('ordersListContainer');
  
  const orders = [
    { id: '#SS-10045', date: '2025-04-20', product: 'Vintage Vinyl Collection', amount: '$450', status: 'Delivered' },
    { id: '#SS-10044', date: '2025-04-18', product: 'Analog Synth Presets', amount: '$75', status: 'Delivered' },
    { id: '#SS-10043', date: '2025-04-15', product: 'Drum Kit Pro', amount: '$125', status: 'Processing' },
    { id: '#SS-10042', date: '2025-04-12', product: 'Mastering Bundle', amount: '$800', status: 'Delivered' },
    { id: '#SS-10041', date: '2025-04-10', product: 'Sample Pack Vol. 3', amount: '$199', status: 'Delivered' },
    { id: '#SS-10040', date: '2025-04-08', product: 'EQ Plugin Suite', amount: '$299', status: 'Delivered' }
  ];
  
  ordersListContainer.innerHTML = `
    <table class="orders-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Product</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td class="order-id">${order.id}</td>
            <td>${order.date}</td>
            <td>${order.product}</td>
            <td>${order.amount}</td>
            <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
            <td><button class="btn-secondary btn-sm">View</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function loadAccountSettings() {
  // Load user email
  document.getElementById('profileEmail').value = currentUser?.email || '';
  document.getElementById('profileName').value = currentUser?.user_metadata?.full_name || '';
  document.getElementById('profilePhone').value = currentUser?.user_metadata?.phone || '';
  document.getElementById('profileCompany').value = currentUser?.user_metadata?.company || '';
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  
  const name = document.getElementById('profileName').value;
  const phone = document.getElementById('profilePhone').value;
  const company = document.getElementById('profileCompany').value;
  
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        full_name: name,
        phone,
        company
      }
    });
    
    if (error) throw error;
    
    alert('Profile updated successfully!');
  } catch (error) {
    alert('Profile update failed: ' + error.message);
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;
  
  if (!newPassword || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    alert('Password changed successfully!');
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
  } catch (error) {
    alert('Password change failed: ' + error.message);
  }
}

async function handleDeleteAccount(e) {
  e.preventDefault();
  
  const confirmDelete = prompt('Type "DELETE" to confirm account deletion (this cannot be undone):');
  
  if (confirmDelete !== 'DELETE') {
    alert('Account deletion cancelled');
    return;
  }
  
  try {
    // Delete user via Supabase Admin API would require backend
    // For now, just sign out and show message
    await supabase.auth.signOut();
    alert('Your account has been scheduled for deletion. Please contact support@soundsupply.com for assistance.');
    showAuthPage();
  } catch (error) {
    alert('Account deletion failed: ' + error.message);
  }
}
