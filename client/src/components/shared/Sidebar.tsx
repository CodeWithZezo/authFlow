// ==================== src/components/shared/Sidebar.tsx ====================
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  Layers, LayoutDashboard, Building2, FolderKanban,
  Users, Settings, ChevronDown, Plus, LogOut,
  Shield, KeyRound, MonitorSmartphone, ChevronsUpDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { RoleBadge }    from "@/components/shared/index";

// ─── Nav item ─────────────────────────────────────────────────────────────────
interface NavItemProps {
  to:       string;
  icon:     React.ElementType;
  label:    string;
  end?:     boolean;
}

function NavItem({ to, icon: Icon, label }: NavItemProps) {
  const location = useLocation();
  const active   = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={cn(
        "nav-item group",
        active
          ? "nav-item-active"
          : "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "flex-shrink-0 transition-colors",
          active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label px-3 mb-1 mt-5 first:mt-0">{children}</p>
  );
}

// ─── Org switcher ─────────────────────────────────────────────────────────────
function OrgSwitcher() {
  const navigate  = useNavigate();
  const { orgs, activeOrg, setActiveOrg } = useOrgStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (org: typeof orgs[0]) => {
    setActiveOrg(org);
    navigate(`/orgs/${org._id}/overview`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-2.5",
          "border border-[var(--color-border)] bg-[var(--color-surface-2)]",
          "hover:border-[var(--color-border-2)] hover:bg-[var(--color-surface-3)]",
          "transition-all duration-150 cursor-pointer",
          open && "border-[var(--color-accent)]/30"
        )}
      >
        {/* Org avatar */}
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white text-xs font-bold">
          {activeOrg ? getInitials(activeOrg.name) : "?"}
        </div>

        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
            {activeOrg?.name ?? "Select org"}
          </p>
          {activeOrg && (
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              /{activeOrg.slug}
            </p>
          )}
        </div>

        <ChevronsUpDown size={14} className="flex-shrink-0 text-[var(--color-text-muted)]" />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute left-0 right-0 top-full z-20 mt-1.5",
            "overflow-hidden rounded-[var(--radius-lg)]",
            "border border-[var(--color-border)] bg-[var(--color-surface-2)]",
            "shadow-[var(--shadow-lg)] animate-scale-in"
          )}>
            {/* Org list */}
            {orgs.length > 0 && (
              <div className="p-1.5">
                <p className="section-label px-2 py-1">Organizations</p>
                {orgs.map((org) => (
                  <button
                    key={org._id}
                    onClick={() => handleSelect(org)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-2 py-2",
                      "text-left text-sm transition-colors",
                      "hover:bg-[var(--color-surface-3)]",
                      activeOrg?._id === org._id
                        ? "text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)]"
                    )}
                  >
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-dim)] text-[var(--color-accent)] text-xs font-bold">
                      {getInitials(org.name)}
                    </div>
                    <span className="flex-1 truncate font-medium">{org.name}</span>
                    {activeOrg?._id === org._id && (
                      <Check size={13} className="text-[var(--color-accent)]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Divider + create */}
            <div className="border-t border-[var(--color-border)] p-1.5">
              <Link
                to="/orgs/new"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2",
                  "text-sm text-[var(--color-text-secondary)]",
                  "hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-primary)]",
                  "transition-colors"
                )}
              >
                <Plus size={14} />
                New organization
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── User section ─────────────────────────────────────────────────────────────
function UserSection() {
  const { user, logout, status } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="border-t border-[var(--color-border)] p-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-xs font-bold">
          {getInitials(user.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{user.fullName}</p>
          <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={status.logout.loading}
          title="Sign out"
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg",
            "text-[var(--color-text-muted)] hover:text-red-400",
            "hover:bg-red-400/10 transition-all duration-150"
          )}
        >
          {status.logout.loading
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            : <LogOut size={14} />
          }
        </button>
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────
export function Sidebar() {
  const { activeOrg, userMembership } = useOrgStore();
  const orgId = activeOrg?._id;

  return (
    <aside className={cn(
      "flex h-screen w-60 flex-shrink-0 flex-col",
      "border-r border-[var(--color-border)] bg-[var(--color-surface)]"
    )}>

      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-[var(--color-border)] px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent)] shadow-[var(--shadow-glow)]">
          <Layers size={16} className="text-white" />
        </div>
        <span className="font-display text-base font-bold tracking-tight">Nexus</span>
      </div>

      {/* Scrollable nav area */}
      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 gap-0.5">

        {/* Org switcher */}
        <div className="mb-4">
          <OrgSwitcher />
        </div>

        {/* General */}
        <SectionLabel>General</SectionLabel>
        <NavItem to="/dashboard"    icon={LayoutDashboard} label="Dashboard" />

        {/* Org-scoped nav */}
        {orgId && (
          <>
            <SectionLabel>Organization</SectionLabel>
            <NavItem to={`/orgs/${orgId}/overview`} icon={Building2}      label="Overview"  />
            <NavItem to={`/orgs/${orgId}/members`}  icon={Users}          label="Members"   />
            <NavItem to={`/orgs/${orgId}/projects`} icon={FolderKanban}   label="Projects"  />
            <NavItem to={`/orgs/${orgId}/settings`} icon={Settings}       label="Settings"  />
          </>
        )}

        {/* Account */}
        <SectionLabel>Account</SectionLabel>
        <NavItem to="/account/profile"  icon={Users}           label="Profile"   />
        <NavItem to="/account/sessions" icon={MonitorSmartphone} label="Sessions" />
        <NavItem to="/account/security" icon={KeyRound}        label="Security"  />

        {/* Membership badge */}
        {userMembership && (
          <div className="mt-4 flex items-center gap-2 px-3">
            <Shield size={12} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Your role:</span>
            <RoleBadge role={userMembership.role} />
          </div>
        )}
      </div>

      {/* User section at bottom */}
      <UserSection />
    </aside>
  );
}
