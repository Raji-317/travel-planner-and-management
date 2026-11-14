const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = {
  getToken() {
    return localStorage.getItem('travel_auth_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('travel_auth_token', token);
    } else {
      localStorage.removeItem('travel_auth_token');
    }
  },

  getUser() {
    const raw = localStorage.getItem('travel_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('travel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('travel_user');
    }
  },

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data && data.error ? data.error : `HTTP ${response.status} Request Failed`;
        throw new Error(errorMsg);
      }

      return data ? data.data : null;
    } catch (err) {
      console.error(`API Error on ${url}:`, err);
      throw err;
    }
  },

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.append(k, v);
        }
      });
      const qStr = qs.toString();
      if (qStr) url += (url.includes('?') ? '&' : '?') + qStr;
    }
    return this.request(url, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body || {}),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

