import { create } from 'zustand';
import { usersAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.login(email, password);
      const { user, token } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error en login';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (nombre, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersAPI.register({ 
        nombre_usuario: nombre, 
        correo: email, 
        contrasena: password 
      });
      const { user, token } = response.data;
      set({ user, token, isLoading: false });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error en registro';
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      await usersAPI.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export const useGamesStore = create((set) => ({
  games: [],
  currentGame: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,

  setGames: (games) => set({ games }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addItem: (game) => {
    const { items } = get();
    const exists = items.find((item) => item.id_juego === game.id_juego || item.id === game.id);
    if (!exists) {
      set({ items: [...items, game] });
    }
  },

  removeItem: (gameId) => {
    const { items } = get();
    set({ items: items.filter((item) => (item.id_juego || item.id) !== gameId) });
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => total + parseFloat(item.precio || 0), 0);
  },

  clearError: () => set({ error: null }),
}));

export const useWishlistStore = create((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  addItem: (game) => {
    const { items } = get();
    const exists = items.find((item) => item.id_juego === game.id_juego || item.id === game.id);
    if (!exists) {
      set({ items: [...items, game] });
    }
  },

  removeItem: (gameId) => {
    const { items } = get();
    set({ items: items.filter((item) => (item.id_juego || item.id) !== gameId) });
  },

  clearError: () => set({ error: null }),
}));
