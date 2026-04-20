// ==================== src/layouts/AccountLayout.tsx ====================
import { Outlet, NavLink } from "react-router";
import { User, MonitorSmartphone, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Profile",  path: "/account/profile",  icon: User              },
  { label: "Sessions", path: "/account/sessions", icon: MonitorSmartphone },
  { label: "Security", path: "/account/security", icon: KeyRound          },
] as const;

export function AccountLayout() {
  return (
    <div className="animate-slide-up">
      <div className="mb-5 sm:mb-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your profile, sessions, and security settings.
        </p>
      </div>

      {/* Mobile: horizontal tab bar | Desktop: vertical sidebar */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">

        {/* ── Mobile tab bar ────────────────────────────────────────────── */}
        <nav className="flex sm:hidden gap-1 border-b border-[var(--color-border)] pb-1 -mx-4 px-4 overflow-x-auto scrollbar-none">
          {TABS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                  isActive
                    ? "bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border border-[var(--color-accent)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} className={isActive ? "text-[var(--color-accent)]" : ""} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Desktop sidebar nav ───────────────────────────────────────── */}
        <nav className="hidden sm:flex w-44 flex-shrink-0 flex-col gap-1">
          {TABS.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "nav-item",
                  isActive
                    ? "nav-item-active"
                    : "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={15}
                    className={isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Page content ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
