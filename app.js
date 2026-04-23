// Supabase Client Initialization
const supabaseUrl = 'https://oosjahmlsdierkeetnaq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vc2phaG1sc2RpZXJrZWV0bmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTQ3MzksImV4cCI6MjA5MjQ5MDczOX0.LLb9GYBvgXJlo8q3MHIue0QLeKwo44GJA_v845iMi-M';

let supabase = null;
let currentUser = null;

// Initialize Supabase
function initSupabase() {
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase library not loaded');
    return false;
  }
  try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log('✓ Supabase initialized');
    return true;
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    return false;
  }
}

// DOM Setup - Hide dashboard by default
document.addEventListener('DOMContentLoaded', () => {
  const authContainer = document.getElementById('authContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  
  // Force dashboard hidden on load
  if (dashboardContainer) dashboardContainer.style.display = 'none';
  if (authContainer) authContainer.style.display = 'flex';
  
  // Initialize Supabase
  if (!initSupabase()) {
    alert('Failed to load authentication. Please refresh.');
    return;
  }

  setupAuthHandlers();
  setupDashboardHandlers();
  checkExistingSession();
});

// Check if user already logged in
async function checkExistingSession() {
  if (!supabase) return;
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (user) {
      currentUser = user;
      showDashboard();
    }
  } catch (err) {
    console.error('Session check error:', err);
  }
}

// Setup Auth Handlers
function setupAuthHandlers() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginToggle = document.getElementById('loginToggle');
  const signupToggle = document.getElementById('signupToggle');

  // Toggle between forms
  if (loginToggle) {
    loginToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginForm) loginForm.style.display = 'flex';
      if (signupForm) signupForm.style.display = 'none';
      loginToggle.classList.add('active');
      signupToggle.classList.remove('active');
    });
  }

  if (signupToggle) {
    signupToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'flex';
      loginToggle.classList.remove('active');
      signupToggle.classList.add('active');
    });
  }

  // Login submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !password) {
        alert('Please enter email and password');
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          currentUser = data.user;
          showDashboard();
        }
      } catch (error) {
        alert('Login error: ' + error.message);
      }
    });
  }

  // Signup submit
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail')?.value;
      const password = document.getElementById('signupPassword')?.value;
      const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

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
          password,
        });

        if (error) throw error;
        alert('Signup successful! Check your email to confirm.');
        signupForm.reset();
        // Switch back to login
        if (loginForm) loginForm.style.display = 'flex';
        if (signupForm) signupForm.style.display = 'none';
        document.getElementById('loginToggle').classList.add('active');
        document.getElementById('signupToggle').classList.remove('active');
      } catch (error) {
        alert('Signup error: ' + error.message);
      }
    });
  }
}

// Setup Dashboard Handlers
function setupDashboardHandlers() {
  const logoutBtn = document.getElementById('logoutBtn');
  const overviewTab = document.getElementById('overviewTab');
  const ordersTab = document.getElementById('ordersTab');
  const accountTab = document.getElementById('accountTab');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await supabase.auth.signOut();
        currentUser = null;
        showAuthForm();
      } catch (err) {
        alert('Logout error: ' + err.message);
      }
    });
  }

  if (overviewTab) overviewTab.addEventListener('click', () => showTab('overview'));
  if (ordersTab) ordersTab.addEventListener('click', () => showTab('orders'));
  if (accountTab) accountTab.addEventListener('click', () => showTab('account'));

  // Setup account handlers
  const updateProfileBtn = document.getElementById('updateProfileBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  if (updateProfileBtn) {
    updateProfileBtn.addEventListener('click', () => {
      alert('Profile update: feature coming soon');
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async () => {
      const newPassword = document.getElementById('newPassword')?.value;
      const confirmPassword = document.getElementById('confirmNewPassword')?.value;

      if (!newPassword || !confirmPassword) {
        alert('Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        alert('Password updated!');
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
      } catch (err) {
        alert('Password change error: ' + err.message);
      }
    });
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (confirm('Really delete your account? This cannot be undone.')) {
        try {
          await supabase.auth.signOut();
          alert('Account deletion requested. Check your email.');
          currentUser = null;
          showAuthForm();
        } catch (err) {
          alert('Deletion error: ' + err.message);
        }
      }
    });
  }
}

// Show/Hide Views
function showAuthForm() {
  const authContainer = document.getElementById('authContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  
  if (authContainer) authContainer.style.display = 'flex';
  if (dashboardContainer) dashboardContainer.style.display = 'none';
}

function showDashboard() {
  const authContainer = document.getElementById('authContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  
  if (authContainer) authContainer.style.display = 'none';
  if (dashboardContainer) dashboardContainer.style.display = 'block';

  // Populate dashboard
  if (currentUser) {
    const userEmail = document.getElementById('userEmail');
    const profileEmail = document.getElementById('profileEmail');
    if (userEmail) userEmail.textContent = currentUser.email;
    if (profileEmail) profileEmail.value = currentUser.email;
  }

  showTab('overview');
}

// Tab System
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Deactivate all buttons
  document.getElementById('overviewTab')?.classList.remove('active');
  document.getElementById('ordersTab')?.classList.remove('active');
  document.getElementById('accountTab')?.classList.remove('active');

  // Show selected tab
  const tabContent = document.getElementById(`${tabName}Content`);
  if (tabContent) tabContent.classList.add('active');

  const tabBtn = document.getElementById(`${tabName}Tab`);
  if (tabBtn) tabBtn.classList.add('active');

  // Load content
  if (tabName === 'overview') loadOverviewTab();
  if (tabName === 'orders') loadOrdersTab();
  if (tabName === 'account') loadAccountTab();
}

// Load Overview Tab
function loadOverviewTab() {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  const stats = [
    { label: 'Total Orders', value: '8' },
    { label: 'Total Spent', value: '$1,245.00' },
    { label: 'Pending Orders', value: '2' },
    { label: 'Active Downloads', value: '3' },
  ];

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

  const recentOrders = [
    { id: '#SS-001', date: '2025-12-20', amount: '$299.00', status: 'completed' },
    { id: '#SS-002', date: '2025-12-18', amount: '$149.50', status: 'in-progress' },
    { id: '#SS-003', date: '2025-12-15', amount: '$75.00', status: 'completed' },
  ];

  const recentContainer = document.getElementById('recentOrdersContainer');
  if (recentContainer) {
    recentContainer.innerHTML = recentOrders
      .map(
        (order) => `
      <div class="order-item">
        <div class="order-info">
          <div class="order-id">${order.id}</div>
          <div class="order-date">${order.date}</div>
        </div>
        <div class="order-status ${order.status}">${order.status.replace('-', ' ')}</div>
        <div class="order-amount">${order.amount}</div>
      </div>
    `
      )
      .join('');
  }
}

// Load Orders Tab
function loadOrdersTab() {
  const ordersContainer = document.getElementById('ordersListContainer');
  if (!ordersContainer) return;

  const orders = [
    { id: '#SS-001', date: '2025-12-20', items: 'Vintage Synth Pack', amount: '$299.00', status: 'completed' },
    { id: '#SS-002', date: '2025-12-18', items: 'Vocal Processing Bundle', amount: '$149.50', status: 'in-progress' },
    { id: '#SS-003', date: '2025-12-15', items: 'Drum Kit Collection', amount: '$75.00', status: 'completed' },
    { id: '#SS-004', date: '2025-12-10', items: 'Ambient Pad Library', amount: '$49.99', status: 'completed' },
    { id: '#SS-005', date: '2025-12-05', items: 'Bass Synth Pack', amount: '$89.00', status: 'completed' },
  ];

  ordersContainer.innerHTML = orders
    .map(
      (order) => `
    <div class="order-item">
      <div><strong>${order.id}</strong></div>
      <div>${order.date}</div>
      <div>${order.items}</div>
      <div>${order.amount}</div>
      <div class="order-status ${order.status}">${order.status.replace('-', ' ')}</div>
    </div>
  `
    )
    .join('');
}

// Load Account Tab
function loadAccountTab() {
  // Just setup event listeners (done in setupDashboardHandlers)
}
