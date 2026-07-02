// ===== LIB/API.JS — Client API Afrikonnect =====
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injecter le token JWT automatiquement
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('afk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rediriger vers /login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('afk_token');
      localStorage.removeItem('afk_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ===== COMMANDES =====
export const commandesAPI = {
  list:       ()       => api.get('/commandes'),
  get:        (id)     => api.get(`/commandes/${id}`),
  create:     (data)   => api.post('/commandes', data),
  updateStatut: (id, data) => api.patch(`/commandes/${id}/statut`, data),
};

// ===== PRODUITS =====
export const produitsAPI = {
  list:   (params) => api.get('/produits', { params }),
  get:    (id)     => api.get(`/produits/${id}`),
  create: (data)   => api.post('/produits', data),
};

// ===== CONFORMITE =====
export const conformiteAPI = {
  verifier:   (data) => api.post('/conformite/verifier', data),
  codes:      ()     => api.get('/conformite/codes'),
  historique: ()     => api.get('/conformite/historique'),
};

// ===== STRIPE =====
export const stripeAPI = {
  createCheckout: (plan) => api.post('/stripe/create-checkout', { plan }),
  portal:         ()     => api.post('/stripe/portal'),
  subscription:   ()     => api.get('/stripe/subscription'),
};

// ===== MESSAGES =====
export const messagesAPI = {
  list:   ()     => api.get('/messages'),
  send:   (data) => api.post('/messages', data),
  markRead: (id) => api.patch(`/messages/${id}/read`),
};

// ===== TONTINES =====
export const tontinesAPI = {
  list:   ()     => api.get('/tontines'),
  get:    (id)   => api.get(`/tontines/${id}`),
  create: (data) => api.post('/tontines', data),
};

// ===== GROUPES =====
export const groupesAPI = {
  list:     ()     => api.get('/groupes'),
  rejoindre: (id)  => api.post(`/groupes/${id}/rejoindre`),
  create:   (data) => api.post('/groupes', data),
};

export default api;
