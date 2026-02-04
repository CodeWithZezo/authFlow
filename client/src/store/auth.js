// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import axios from 'axios';

// ==================== API Configuration ====================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Tokens are in httpOnly cookies, so we don't need to manually add them
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/users/refresh-token');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        useAuthStore.getState().reset();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== Initial State ====================
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ==================== Zustand Store ====================
export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ==================== Signup ====================
        signup: async (data) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await api.post('/users/signup', data);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            
            throw error;
          }
        },

        // ==================== Login ====================
        login: async (data) => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await api.post('/users/login', data);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
            
            throw error;
          }
        },

        // ==================== Logout ====================
        logout: async () => {
          set({ isLoading: true, error: null });
          
          try {
            await api.post('/users/logout');
            
            set({
              ...initialState,
            });
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Logout failed';
            
            set({
              isLoading: false,
              error: errorMessage,
            });
            
            // Even if logout fails, clear local state
            set({
              ...initialState,
            });
          }
        },

        // ==================== Get Current User ====================
        getCurrentUser: async () => {
          set({ isLoading: true, error: null });
          
          try {
            const response = await api.post('/users/me');
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to get user';
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorMessage,
            });
          }
        },

        // ==================== Refresh Token ====================
        refreshToken: async () => {
          try {
            await api.post('/users/refresh-token');
          } catch (error) {
            // If refresh fails, logout
            get().reset();
            throw error;
          }
        },

        // ==================== Clear Error ====================
        clearError: () => {
          set({ error: null });
        },

        // ==================== Reset State ====================
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'auth-storage', // unique name for localStorage key
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist user and isAuthenticated
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore', // DevTools name
    }
  )
);

// ==================== Selectors (for optimized re-renders) ====================
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// ==================== Export API instance ====================
export { api };