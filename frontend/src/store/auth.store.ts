import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'WORKER' | 'INVENTORY_MANAGER' | 'USER';
  showroom_id: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: { phone: string; password: string }) => Promise<User>;
  register: (data: { full_name: string; phone: string; password: string; email?: string }) => Promise<User>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await apiClient<{ success: boolean; data: { token: string; user: User } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const user = res.data.user;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await apiClient<{ success: boolean; data: { token: string; user: User } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const user = res.data.user;
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient<{ success: boolean; data: { user: User } }>('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
