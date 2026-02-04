// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated, useAuthLoading } from '../store/auth';

export const ProtectedRoute = ({ redirectTo = '/login', children }) => {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};