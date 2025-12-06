import axios from "axios";

// ------------------------------
// BASE URL – FIXED 🔥
// ------------------------------
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ------------------------------
// AXIOS INSTANCE
// ------------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ------------------------------
// ADD JWT TOKEN TO EVERY REQUEST
// ------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------
// AUTO-LOGOUT ON 401
// ------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ------------------------------
// AUTH API
// ------------------------------
export const authAPI = {
  register: (data) => api.post("auth/register", data),
  login: (data) => api.post("auth/login", data),
};

// ------------------------------
// TENANT API (🔥 FIXED PATHS – NO LEADING SLASHES)
// ------------------------------
export const tenantAPI = {
  getAll: () => api.get("tenants"),
  getById: (id) => api.get(`tenants/${id}`),
  delete: (id) => api.delete(`tenants/${id}`),
  sync: (id) => api.post(`tenants/${id}/sync`),
};

// ------------------------------
// ANALYTICS API
// ------------------------------
export const analyticsAPI = {
  getOverview: (tenantId) =>
    api.get(`analytics/overview?tenant_id=${tenantId}`),

  getRevenue: (tenantId, startDate, endDate) =>
    api.get(
      `analytics/revenue?tenant_id=${tenantId}&start_date=${startDate}&end_date=${endDate}`
    ),

  getTopCustomers: (tenantId, limit = 5) =>
    api.get(`analytics/top-customers?tenant_id=${tenantId}&limit=${limit}`),

  getOrdersByDate: (tenantId, startDate, endDate) =>
    api.get(
      `analytics/orders-by-date?tenant_id=${tenantId}&start_date=${startDate}&end_date=${endDate}`
    ),
};

// ------------------------------
// CUSTOMERS API
// ------------------------------
export const customerAPI = {
  getAll: (tenantId, page = 1, limit = 20) =>
    api.get(`customers?tenant_id=${tenantId}&page=${page}&limit=${limit}`),

  getById: (id) => api.get(`customers/${id}`),

  search: (tenantId, query) =>
    api.get(`customers/search?tenant_id=${tenantId}&q=${query}`),
};

// ------------------------------
// ORDERS API
// ------------------------------
export const orderAPI = {
  getAll: (tenantId, page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      tenant_id: tenantId,
      page,
      limit,
      ...filters,
    });
    return api.get(`orders?${params.toString()}`);
  },

  getById: (id) => api.get(`orders/${id}`),
};

// ------------------------------
// PRODUCTS API
// ------------------------------
export const productAPI = {
  getAll: (tenantId, page = 1, limit = 20) =>
    api.get(`products?tenant_id=${tenantId}&page=${page}&limit=${limit}`),

  getById: (id) => api.get(`products/${id}`),
};

export default api;
