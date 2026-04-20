// ==================== src/components/shared/Topbar.tsx ====================
import { useLocation, Link } from "react-router";
import {
  Bell, Search, Menu, X, ChevronRight, Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { getInitials }  from "@/lib/utils";

function useBreadcrumbs() {
  const location   = useLocation();
  const { activeOrg } = useOrgStore();
  const segments   = location.pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  segments.forEach((seg, i) => {
    const href  = "/" + segments.slice(0, i + 1).join("/");
    let label   = seg;

    if (seg === activeOrg?._id) label = activeOrg.name;

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

interface TopbarProps {
  onMenuToggle?: () => void;
  menuOpen?:     boolean;
}

export function Topbar({ onMenuToggle, menuOpen }: TopbarProps) {
  const crumbs   = useBreadcrumbs();
  const { user } = useAuthStore();

  // On mobile, show only last 2 crumbs to save space
  const visibleCrumbs = crumbs.length > 2
    ? [{ label: "…", href: crumbs[crumbs.length - 2].href }, crumbs[crumbs.length - 1]]
    : crumbs;

  return (
    <header className={cn(
      "flex h-14 flex-shrink-0 items-center justify-between gap-3",
      "border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 sm:px-5"
    )}>

      {/* Left — mobile menu toggle + breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] transition-colors flex-shrink-0"
          onClick={onMenuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm min-w-0">
          {/* Desktop: show all crumbs */}
          <div className="hidden sm:flex items-center gap-1 min-w-0">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={13} className="flex-shrink-0 text-[var(--color-text-muted)]" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[180px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          {/* Mobile: show condensed crumbs */}
          <div className="flex sm:hidden items-center gap-1 min-w-0">
            {visibleCrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={12} className="flex-shrink-0 text-[var(--color-text-muted)]" />}
                {i === visibleCrumbs.length - 1 ? (
                  <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[140px] text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-[var(--color-text-muted)] transition-colors truncate text-sm"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
        </nav>
      </div>

      {/* Right — search + notifications + avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

        {/* Search trigger — hidden on small mobile */}
        <button className={cn(
          "hidden sm:flex items-center gap-2.5 rounded-[var(--radius)]",
          "border border-[var(--color-border)] bg-[var(--color-surface-2)]",
          "px-3 py-1.5 text-xs text-[var(--color-text-muted)]",
          "hover:border-[var(--color-border-2)] hover:text-[var(--color-text-secondary)]",
          "transition-all duration-150 cursor-text w-36 md:w-44"
        )}>
          <Search size={13} />
          <span className="flex-1 text-left">Search...</span>
          <span className="hidden md:flex items-center gap-0.5 opacity-60">
            <Command size={10} />
            <span>K</span>
          </span>
        </button>

        {/* Search icon-only on mobile */}
        <button className={cn(
          "sm:hidden flex h-9 w-9 items-center justify-center rounded-lg",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface-2)] transition-all duration-150"
        )}>
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg",
          "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-surface-2)] transition-all duration-150"
        )}>
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
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
