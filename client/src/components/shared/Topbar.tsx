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

  const visibleCrumbs = crumbs.length > 2
    ? [{ label: "…", href: crumbs[crumbs.length - 2].href }, crumbs[crumbs.length - 1]]
    : crumbs;

  return (
    <header className={cn(
      "flex h-14 shrink-0 items-center justify-between gap-3",
      "border-b border-border bg-surface px-3 sm:px-5"
    )}>

      {/* Left — mobile menu toggle + breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex items-center justify-center h-9 w-9 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors shrink-0"
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
                {i > 0 && <ChevronRight size={13} className="shrink-0 text-text-muted" />}
                {i === crumbs.length - 1 ? (
                  <span className="font-semibold text-text-primary truncate max-w-45">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-text-muted hover:text-text-secondary transition-colors truncate max-w-30"
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
                {i > 0 && <ChevronRight size={12} className="shrink-0 text-text-muted" />}
                {i === visibleCrumbs.length - 1 ? (
                  <span className="font-semibold text-text-primary truncate max-w-35 text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-text-muted transition-colors truncate text-sm"
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
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Search trigger — hidden on small mobile */}
        <button className={cn(
          "hidden sm:flex items-center gap-2.5 rounded-(--radius)",
          "border border-border bg-surface-2",
          "px-3 py-1.5 text-xs text-text-muted",
          "hover:border-border-2 hover:text-text-secondary",
          "transition-all duration-150 cursor-text w-36 md:w-44",
          "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        )}>
          <Search size={13} />
          <span className="flex-1 text-left">Search...</span>
          <span className="hidden md:flex items-center gap-0.5 opacity-60">
            <Command size={10} />
            <span>K</span>
          </span>
        </button>

        {/* Search icon-only on mobile */}
        <button
          aria-label="Search"
          className={cn(
            "sm:hidden flex h-9 w-9 items-center justify-center",
            "text-text-muted hover:text-text-primary",
            "hover:bg-surface-2 transition-all duration-150",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          )}
        >
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className={cn(
            "relative flex h-9 w-9 items-center justify-center",
            "text-text-muted hover:text-text-primary",
            "hover:bg-surface-2 transition-all duration-150",
            "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          )}
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent animate-[pulse-glow_2s_ease-in-out_infinite]" />
        </button>

        {/* User avatar */}
        {user && (
          <Link
            to="/account/profile"
            aria-label={`${user.fullName} – account settings`}
            className="focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-accent text-white text-xs font-bold",
              "hover:opacity-80 transition-opacity duration-150"
            )}>
              {getInitials(user.fullName)}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
