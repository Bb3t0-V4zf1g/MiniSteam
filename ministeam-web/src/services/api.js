import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Games API
export const gamesAPI = {
  getAll: (page = 1, limit = 12, filters = {}) => {
    const params = { page, limit, ...filters };
    return api.get('/games', { params });
  },
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  search: (term, options = {}) => api.get('/games/search', { params: { q: term, ...options } }),
};

// Reviews API
export const reviewsAPI = {
  getByGame: (gameId) => api.get(`/reviews/game/${gameId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Users API
export const usersAPI = {
  register: (data) => api.post('/users/signup', data),
  login: (email, password) => api.post('/users/login', { correo: email, contrasena: password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  logout: () => api.post('/users/logout'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (gameId) => api.post('/cart', { id_juego: gameId }),
  remove: (gameId) => api.delete(`/cart/${gameId}`),
  clear: () => api.delete('/cart'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (gameId) => api.post('/wishlist', { id_juego: gameId }),
  remove: (gameId) => api.delete(`/wishlist/${gameId}`),
};

// Purchases API
export const purchasesAPI = {
  getAll: () => api.get('/purchases'),
  getById: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
};

// Library API
export const libraryAPI = {
  getAll: () => api.get('/library'),
  getByGame: (gameId) => api.get(`/library/${gameId}`),
};

// Genres API
export const genresAPI = {
  getAll: () => api.get('/genres'),
  getById: (id) => api.get(`/genres/${id}`),
};

export default api;
