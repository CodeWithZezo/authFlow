// src/hooks/useAuth.js
import { useAuthStore } from '../store/auth';
import { useCallback } from 'react';

export const useAuth = () => {
  const store = useAuthStore();

  const signup = useCallback(
    async (data) => {
      try {
        await store.signup(data);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Signup failed' 
        };
      }
    },
    [store]
  );

  const login = useCallback(
    async (data) => {
      try {
        await store.login(data);
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Login failed' 
        };
      }
    },
    [store]
  );

  const logout = useCallback(async () => {
    try {
      await store.logout();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Logout failed' 
      };
    }
  }, [store]);

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    signup,
    login,
    logout,
    getCurrentUser: store.getCurrentUser,
    refreshToken: store.refreshToken,
    clearError: store.clearError,
  };
};