import { create } from 'zustand';
import { apiClient } from '../lib/api-client';
import { secureStorage } from '../lib/secure-store';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'WORKER' | 'INVENTORY_MANAGER' | 'USER';
  showroom_id: string | null;
  showroom_name?: string | null;
  showroom_code?: string | null;
  showroom?: {
    id: string;
    name: string;
    code: string;
    address?: string;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { phone: string; password: string }) => Promise<User>;
  register: (data: { full_name: string; phone: string; password: string; email?: string }) => Promise<User>;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/login', credentials);
      const { token, user } = res.data.data;

      await secureStorage.setToken(token);
      await secureStorage.setUser(user);

      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.post('/auth/register', data);
      const { token, user } = res.data.data;

      await secureStorage.setToken(token);
      await secureStorage.setUser(user);

      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      await secureStorage.clearAll();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuthSession: async () => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.getToken();
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const res = await apiClient.get('/auth/me');
      const user = res.data.data.user;
      await secureStorage.setUser(user);

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch {
      await secureStorage.clearAll();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
