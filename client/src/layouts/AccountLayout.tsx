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
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Manage your profile, sessions, and security settings.
        </p>
      </div>

      <div className="flex gap-8">
        {/* ── Sidebar nav ──────────────────────────────────────────────── */}
        <nav className="flex w-48 flex-shrink-0 flex-col gap-1">
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
