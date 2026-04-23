// Supabase REST API
const SUPABASE_URL = 'https://oosjahmlsdierkeetnaq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vc2phaG1sc2RpZXJrZWV0bmFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTQ3MzksImV4cCI6MjA5MjQ5MDczOX0.LLb9GYBvgXJlo8q3MHIue0QLeKwo44GJA_v845iMi-M';

let currentUser = null;
let sessionToken = null;

// Supabase Auth API
async function supabaseAuth(endpoint, method = 'POST', body = null) {
  const url = `${SUPABASE_URL}/auth/v1${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.message || 'Error');
    return data;
  } catch (err) {
    throw err;
  }
}

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
  // Hide dashboard initially
  document.getElementById('dashboardContainer').style.display = 'none';
  document.getElementById('authContainer').style.display = 'flex';

  setupAuthHandlers();
  setupDashboardHandlers();
  checkExistingSession();
});

// Check existing session
function checkExistingSession() {
  const token = localStorage.getItem('supabase_token');
  const user = localStorage.getItem('supabase_user');

  if (token && user) {
    try {
      sessionToken = token;
      currentUser = JSON.parse(user);
      showDashboard();
    } catch (err) {
      console.error('Session restore failed:', err);
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('supabase_user');
    }
  }
}

// ===== AUTH HANDLERS =====
function setupAuthHandlers() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const resetPasswordForm = document.getElementById('resetPasswordForm');

  const showSignupBtn = document.getElementById('showSignupBtn');
  const showLoginBtn = document.getElementById('showLoginBtn');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');

  // Toggle forms
  showSignupBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    resetPasswordForm.style.display = 'none';
    document.getElementById('authToggle').style.display = 'none';
    document.getElementById('signupToggle').style.display = 'block';
  });

  showLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    resetPasswordForm.style.display = 'none';
    document.getElementById('authToggle').style.display = 'block';
    document.getElementById('signupToggle').style.display = 'none';
  });

  forgotPasswordBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    resetPasswordForm.style.display = 'flex';
    document.getElementById('authToggle').style.display = 'none';
    document.getElementById('signupToggle').style.display = 'none';
  });

  backToLoginBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    resetPasswordForm.style.display = 'none';
    document.getElementById('authToggle').style.display = 'block';
    document.getElementById('signupToggle').style.display = 'none';
  });

  // Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const response = await supabaseAuth('/token?grant_type=password', 'POST', {
        email,
        password,
      });

      sessionToken = response.access_token;
      currentUser = response.user;

      localStorage.setItem('supabase_token', sessionToken);
      localStorage.setItem('supabase_user', JSON.stringify(currentUser));

      showDashboard();
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  });

  // Signup
  signupForm?.addEventListener('submit', async (e) => {
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
      await supabaseAuth('/signup', 'POST', { email, password });
      showConfirmationReceipt(email);
      signupForm.reset();
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  });

  // Password Reset
  resetPasswordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;

    if (!email) {
      alert('Please enter your email');
      return;
    }

    try {
      await supabaseAuth('/recover', 'POST', { email });
      alert('Password reset link sent to your email!');
      document.getElementById('loginForm').style.display = 'flex';
      resetPasswordForm.style.display = 'none';
      document.getElementById('authToggle').style.display = 'block';
      resetPasswordForm.reset();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
}

// Confirmation Receipt
function showConfirmationReceipt(email) {
  const receipt = document.getElementById('confirmationReceipt');
  const emailDisplay = document.getElementById('confirmationEmail');
  const doneBtn = document.getElementById('confirmationDone');
  const resendBtn = document.getElementById('resendEmailBtn');

  if (emailDisplay) emailDisplay.textContent = email;

  // Store email for resend
  sessionStorage.setItem('signup_email', email);

  if (receipt) {
    receipt.classList.add('show');

    doneBtn.onclick = () => {
      receipt.classList.remove('show');
      const loginForm = document.getElementById('loginForm');
      const signupForm = document.getElementById('signupForm');
      if (loginForm) loginForm.style.display = 'flex';
      if (signupForm) signupForm.style.display = 'none';
      document.getElementById('authToggle').style.display = 'block';
      document.getElementById('signupToggle').style.display = 'none';
    };

    resendBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      showResendEmailModal(email);
    });
  }
}

// Resend Email Modal
function showResendEmailModal(defaultEmail) {
  const modal = document.getElementById('resendEmailModal');
  const form = document.getElementById('resendEmailForm');
  const closeBtn = document.getElementById('closeResendModal');
  const input = document.getElementById('resendEmailInput');

  if (input) input.value = defaultEmail;

  if (modal) modal.style.display = 'flex';

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value;

    try {
      await supabaseAuth('/resend', 'POST', { email, type: 'signup' });
      alert('Confirmation email resent! Check your inbox.');
      if (modal) modal.style.display = 'none';
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });

  closeBtn?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });
}

// ===== DASHBOARD HANDLERS =====
function setupDashboardHandlers() {
  const logoutBtn = document.getElementById('logoutBtn');
  const overviewTab = document.getElementById('overviewTab');
  const ordersTab = document.getElementById('ordersTab');
  const downloadsTab = document.getElementById('downloadsTab');
  const accountTab = document.getElementById('accountTab');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');

  logoutBtn?.addEventListener('click', () => {
    currentUser = null;
    sessionToken = null;
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_user');
    showAuthForm();
  });

  overviewTab?.addEventListener('click', () => showTab('overview'));
  ordersTab?.addEventListener('click', () => showTab('orders'));
  downloadsTab?.addEventListener('click', () => showTab('downloads'));
  accountTab?.addEventListener('click', () => showTab('account'));

  menuToggle?.addEventListener('click', () => {
    if (sidebar) sidebar.classList.toggle('open');
  });

  // Account form handlers
  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');

  profileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Profile saved!');
  });

  passwordForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (!newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await supabaseAuth('/user', 'PUT', { password: newPassword });
      alert('Password updated!');
      passwordForm.reset();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });

  deleteAccountBtn?.addEventListener('click', () => {
    if (confirm('Really delete your account? This cannot be undone.')) {
      currentUser = null;
      sessionToken = null;
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('supabase_user');
      alert('Account deletion requested. Check your email for confirmation.');
      showAuthForm();
    }
  });
}

// ===== VIEW MANAGEMENT =====
function showAuthForm() {
  document.getElementById('authContainer').style.display = 'flex';
  document.getElementById('dashboardContainer').style.display = 'none';
}

function showDashboard() {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('dashboardContainer').style.display = 'flex';

  if (currentUser) {
    const userEmail = document.getElementById('userEmail');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const profileEmail = document.getElementById('profileEmail');

    if (userEmail) userEmail.textContent = currentUser.email;
    if (userName) userName.textContent = currentUser.email.split('@')[0];
    if (userAvatar) userAvatar.textContent = currentUser.email[0].toUpperCase();
    if (profileEmail) profileEmail.value = currentUser.email;
  }

  showTab('overview');
}

// ===== TAB SYSTEM =====
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.style.display = 'none';
  });

  // Deactivate all buttons
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Show selected tab
  const tab = document.getElementById(`${tabName}Content`);
  if (tab) tab.style.display = 'block';

  const btn = document.getElementById(`${tabName}Tab`);
  if (btn) btn.classList.add('active');

  // Update header
  const titles = {
    overview: 'Dashboard Overview',
    orders: 'Order History',
    downloads: 'Your Downloads',
    account: 'Account Settings',
  };
  const subtitles = {
    overview: 'Welcome back',
    orders: 'Manage your orders',
    downloads: 'Access your files',
    account: 'Manage your account',
  };

  document.getElementById('tabTitle').textContent = titles[tabName] || 'Dashboard';
  document.getElementById('tabSubtitle').textContent = subtitles[tabName] || '';

  // Load content
  if (tabName === 'overview') loadOverviewTab();
  if (tabName === 'orders') loadOrdersTab();
  if (tabName === 'downloads') loadDownloadsTab();
}

// ===== TAB CONTENT LOADERS =====
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

function loadDownloadsTab() {
  const downloadsContainer = document.getElementById('downloadsListContainer');
  if (!downloadsContainer) return;

  const downloads = [
    { name: 'Vintage Synth Pack', date: '2025-12-20', size: '245 MB' },
    { name: 'Vocal Processing Bundle', date: '2025-12-18', size: '156 MB' },
    { name: 'Drum Kit Collection', date: '2025-12-15', size: '89 MB' },
  ];

  downloadsContainer.innerHTML = downloads
    .map(
      (dl) => `
    <div class="order-item">
      <div class="order-info">
        <div class="order-id">${dl.name}</div>
        <div class="order-date">${dl.date}</div>
      </div>
      <div>${dl.size}</div>
      <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">Download</button>
    </div>
  `
    )
    .join('');
}
