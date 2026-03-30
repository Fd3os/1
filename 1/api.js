const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken = localStorage.getItem('authToken');

const api = {
  setToken: (token) => {
    authToken = token;
    localStorage.setItem('authToken', token);
  },

  getToken: () => authToken,

  clearToken: () => {
    authToken = null;
    localStorage.removeItem('authToken');
  },

  headers: (includeAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return headers;
  },

  auth: {
    register: async (data) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: api.headers(false),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.token) api.setToken(result.token);
      return result;
    },

    login: async (data) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: api.headers(false),
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.token) api.setToken(result.token);
      return result;
    },

    logout: () => {
      api.clearToken();
    },

    getMe: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: api.headers(true)
      });
      return await response.json();
    }
  },

  products: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/products?${params}`, {
        headers: api.headers(false)
      });
      return await response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: api.headers(false)
      });
      return await response.json();
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: api.headers(true)
      });
      return await response.json();
    }
  },

  orders: {
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: api.headers(true)
      });
      return await response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: api.headers(true)
      });
      return await response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    }
  },

  payments: {
    createPaymentIntent: async (orderId) => {
      const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify({ orderId })
      });
      return await response.json();
    },

    confirmPayment: async (orderId, paymentIntentId) => {
      const response = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify({ orderId, paymentIntentId })
      });
      return await response.json();
    },

    manualPayment: async (orderId, cardDetails) => {
      const response = await fetch(`${API_BASE_URL}/payments/manual-payment`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify({ orderId, cardDetails })
      });
      return await response.json();
    },

    bankTransfer: async (orderId) => {
      const response = await fetch(`${API_BASE_URL}/payments/bank-transfer`, {
        method: 'POST',
        headers: api.headers(true),
        body: JSON.stringify({ orderId })
      });
      return await response.json();
    }
  },

  users: {
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: api.headers(true)
      });
      return await response.json();
    },

    updateProfile: async (data) => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    },

    changePassword: async (data) => {
      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PUT',
        headers: api.headers(true),
        body: JSON.stringify(data)
      });
      return await response.json();
    }
  }
};
