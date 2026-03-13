// ==================== src/components/shared/ProtectedRoute.tsx ====================
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store";

export function ProtectedRoute() {
  const { isAuthenticated, _hydrated, fetchMe, status } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Wait for Zustand persist to finish reading localStorage.
    // Only then attempt a cookie-based session rehydration via /me.
    if (!_hydrated) return;
    if (!isAuthenticated) fetchMe();
  }, [_hydrated]);

  // While persist is rehydrating OR fetchMe is in-flight, show loader
  if (!_hydrated || status.fetchMe.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
