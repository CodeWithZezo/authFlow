// src/components/AuthInitializer.jsx
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const AuthInitializer = ({ children }) => {
  const getCurrentUser = useAuthStore((state) => state.getCurrentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // On app mount, try to get current user if we think we're authenticated
    if (isAuthenticated) {
      getCurrentUser();
    }
  }, []);

  return <>{children}</>;
};