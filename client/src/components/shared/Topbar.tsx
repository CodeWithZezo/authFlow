// ==================== src/components/shared/Topbar.tsx ====================
import { useState } from "react";
import { useLocation, Link } from "react-router";
import {
  Bell, Search, Menu, X, ChevronRight, Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { getInitials }  from "@/lib/utils";

// ─── Breadcrumb builder from pathname ─────────────────────────────────────────
function useBreadcrumbs() {
  const location   = useLocation();
  const { activeOrg } = useOrgStore();
  const segments   = location.pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  segments.forEach((seg, i) => {
    const href  = "/" + segments.slice(0, i + 1).join("/");
    let label   = seg;

    // Replace IDs with human-readable names
    if (seg === activeOrg?._id) label = activeOrg.name;

    // Prettify segment names
    const labels: Record<string, string> = {
      dashboard: "Dashboard",
      orgs:      "Organizations",
      projects:  "Projects",
      members:   "Members",
      settings:  "Settings",
      overview:  "Overview",
      policy:    "Policy",
      "password-policy": "Password Policy",
      account:   "Account",
      profile:   "Profile",
      sessions:  "Sessions",
      security:  "Security",
      new:       "New",
    };

    crumbs.push({ label: labels[label] ?? label, href });
  });

  return crumbs;
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
interface TopbarProps {
  onMenuToggle?: () => void;
  menuOpen?:     boolean;
}

export function Topbar({ onMenuToggle, menuOpen }: TopbarProps) {
  const crumbs   = useBreadcrumbs();
  const { user } = useAuthStore();

  return (
    <header className={cn(
      "flex h-14 flex-shrink-0 items-center justify-between gap-4",
      "border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5"
    )}>

      {/* Left — mobile menu toggle + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors"
          onClick={onMenuToggle}
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={13} className="flex-shrink-0 text-[var(--color-text-muted)]" />}
              {i === crumbs.length - 1 ? (
                <span className="font-semibold text-[var(--color-text-primary)] truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.href}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right — search + notifications + avatar */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search trigger */}
        <button className={cn(
          "hidden sm:flex items-center gap-2.5 rounded-[var(--radius)]",
          "border border-[var(--color-border)] bg-[var(--color-surface-2)]",
          "px-3 py-1.5 text-xs text-[var(--color-text-muted)]",
          "hover:border-[var(--color-border-2)] hover:text-[var(--color-text-secondary)]",
          "transition-all duration-150 cursor-text w-44"
        )}>
          <Search size={13} />
          <span className="flex-1 text-left">Search...</span>
          <span className="flex items-center gap-0.5 opacity-60">
            <Command size={10} />
            <span>K</span>
          </span>
        </button>

        {/* Notifications */}
        <button className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-lg",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface-2)] transition-all duration-150"
        )}>
          <Bell size={15} />
          {/* Unread dot */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        </button>

        {/* User avatar */}
        {user && (
          <Link to="/account/profile">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-gradient-to-br from-[var(--color-accent)] to-violet-600",
              "text-white text-xs font-bold",
              "ring-2 ring-transparent hover:ring-[var(--color-accent)]/30 transition-all"
            )}>
              {getInitials(user.fullName)}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
