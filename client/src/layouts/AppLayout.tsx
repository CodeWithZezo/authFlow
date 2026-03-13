// ==================== src/layouts/AppLayout.tsx ====================
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar }  from "@/components/shared/Topbar";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">

      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 z-40 h-full lg:hidden animate-slide-right">
            <Sidebar />
          </div>
        </>
      )}

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        <Topbar
          onMenuToggle={() => setMobileOpen((v) => !v)}
          menuOpen={mobileOpen}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
