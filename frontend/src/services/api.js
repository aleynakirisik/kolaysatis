// src/services/api.js
import axios from 'axios';

// Base URL konfigürasyonu
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Cookie desteği için
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token yönetimi için interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token ile yeni token al
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { token } = refreshResponse.data;
        localStorage.setItem('token', token);
        
        // Orijinal isteği tekrar dene
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token da geçersizse logout yap
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API fonksiyonları
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/profile'),
  refreshToken: () => api.post('/refresh-token'),
};

// Ürün API fonksiyonları
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Kategori API fonksiyonları
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Sepet API fonksiyonları
export const cartAPI = {
  get: () => api.get('/cart'),
  update: (cartData) => api.post('/cart', cartData),
  clear: () => api.delete('/cart'),
};

// Admin API fonksiyonları
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Satıcı API fonksiyonları
export const sellerAPI = {
  getProducts: () => api.get('/seller/products'),
  createProduct: (productData) => api.post('/seller/products', productData),
  updateProduct: (id, productData) => api.put(`/seller/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
};

// Test API fonksiyonları
export const testAPI = {
  ping: () => api.get('/test'),
  dbTest: () => api.get('/db-test'),
  usersTest: () => api.get('/users-test'),
  createTestUsers: () => api.get('/create-test-users'),
  createTestCategories: () => api.get('/create-test-categories'),
  createTestProducts: () => api.get('/create-test-products'),
};

export default api;