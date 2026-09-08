const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
  const token = localStorage.getItem('campuscash_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getHeaders(), ...options.headers };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred during API request.');
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),

  // Payments & QR
  initiatePayment: (data) => request('/payments/initiate', { method: 'POST', body: JSON.stringify(data) }),
  confirmPayment: (data) => request('/payments/confirm', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentHistory: () => request('/payments/history'),
  getReceipt: (id) => request(`/payments/${id}`),

  // Student
  getStudentDashboard: () => request('/student/dashboard'),
  getStudentWallet: () => request('/student/dashboard'),
  rechargeStudentWallet: (data) => request('/student/recharge', { method: 'POST', body: JSON.stringify(data) }),
  getRewardsCatalog: () => request('/student/rewards'),
  redeemReward: (data) => request('/student/rewards/redeem', { method: 'POST', body: JSON.stringify(data) }),
  getAIExpenseAnalysis: () => request('/student/ai-expense'),
  getMonthlyReport: (month) => request(`/student/monthly-report${month ? `?month=${month}` : ''}`),

  // Parent
  getParentDashboard: () => request('/parent/dashboard'),
  rechargeChildWallet: (data) => request('/parent/recharge', { method: 'POST', body: JSON.stringify(data) }),
  updateSpendingLimit: (data) => request('/parent/spending-limit', { method: 'POST', body: JSON.stringify(data) }),
  updateSpendingLimits: (data) => request('/parent/spending-limit', { method: 'POST', body: JSON.stringify(data) }),

  // Vendor
  getVendorDashboard: () => request('/vendor/dashboard'),
  generateQR: (data) => request('/vendor/qr', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  getUsers: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateUserStatus: (data) => request('/admin/users/status', { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => request('/admin/audit-logs'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' })
};
