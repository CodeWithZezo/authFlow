// ==================== src/layouts/AppLayout.tsx ====================
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Sidebar }    from "@/components/shared/Sidebar";
import { Topbar }     from "@/components/shared/Topbar";
import { MockBanner } from "@/components/shared/MockBanner";

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-[var(--color-bg)]">

      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 z-40 h-full lg:hidden animate-slide-right">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">

        <Topbar
          onMenuToggle={() => setMobileOpen((v) => !v)}
          menuOpen={mobileOpen}
        />

        <MockBanner />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
