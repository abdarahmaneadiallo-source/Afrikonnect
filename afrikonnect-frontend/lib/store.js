// ===== LIB/STORE.JS — Zustand global state =====
import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  // Initialiser depuis localStorage
  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('afk_token');
      const user  = localStorage.getItem('afk_user');
      if (token && user) {
        set({ token, user: JSON.parse(user), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  // Login
  login: (user, token) => {
    localStorage.setItem('afk_token', token);
    localStorage.setItem('afk_user', JSON.stringify(user));
    set({ user, token });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('afk_token');
    localStorage.removeItem('afk_user');
    set({ user: null, token: null });
  },

  // Mettre à jour le profil
  updateUser: (updates) => {
    const user = { ...get().user, ...updates };
    localStorage.setItem('afk_user', JSON.stringify(user));
    set({ user });
  },

  isPro: () => {
    const { user } = get();
    return user?.plan === 'PRO' || user?.plan === 'FOURNISSEUR';
  },
}));

// ===== UI STORE =====
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  
  notifications: [],
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
}));
