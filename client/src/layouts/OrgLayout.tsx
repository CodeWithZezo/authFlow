// ==================== src/layouts/OrgLayout.tsx ====================
import { useEffect } from "react";
import { Outlet, useParams, useLocation, Link, useNavigate } from "react-router";
import { Building2, Users, FolderKanban, Settings, ArrowLeft } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useOrgStore }     from "@/store/org.store";
import { useAuthStore }    from "@/store/auth.store";
import { RoleBadge, Spinner } from "@/components/shared/index";
import { ORG_ROLES_ADMIN }   from "@/types";

const TABS = [
  { label: "Overview", path: "overview", icon: Building2    },
  { label: "Members",  path: "members",  icon: Users        },
  { label: "Projects", path: "projects", icon: FolderKanban },
  { label: "Settings", path: "settings", icon: Settings     },
] as const;

export function OrgLayout() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuthStore();

  const {
    activeOrg, members, fetchOrg, fetchMembers,
    setUserMembership, status,
  } = useOrgStore();

  useEffect(() => {
    if (!orgId) return;
    fetchOrg(orgId);
    fetchMembers(orgId);
  }, [orgId]);

  useEffect(() => {
    if (!user || members.length === 0) return;
    const mine = members.find((m) => {
      const uid = typeof m.userId === "string" ? m.userId : m.userId._id;
      return uid === user.id;
    });
    setUserMembership(mine ?? null);
  }, [members, user]);

  if (status.fetchOrg.loading && !activeOrg) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-lg font-semibold">Organization not found</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }

  const userMembership = useOrgStore.getState().userMembership;
  const isAdmin = userMembership
    ? ORG_ROLES_ADMIN.includes(userMembership.role)
    : false;

  const activeTab = TABS.find((t) =>
    location.pathname.includes(`/orgs/${orgId}/${t.path}`)
  )?.path;

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">

      {/* ── Org header ─────────────────────────────────────────────────── */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-5">

          {/* Avatar */}
          <div className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-lg sm:text-xl font-bold shadow-[var(--shadow-glow)]">
            {getInitials(activeOrg.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate">
                {activeOrg.name}
              </h1>
              {userMembership && <RoleBadge role={userMembership.role} />}
            </div>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
              /{activeOrg.slug}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </div>

        {/* Tab bar — horizontally scrollable on mobile */}
        <div className="mt-4 sm:mt-5 flex gap-1 border-t border-[var(--color-border)] pt-3 sm:pt-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-none">
          {TABS.map((tab) => {
            if (tab.path === "settings" && !isAdmin) return null;
            const active = activeTab === tab.path;

            return (
              <Link
                key={tab.path}
                to={`/orgs/${orgId}/${tab.path}`}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-[var(--radius)] px-2.5 sm:px-3 py-2",
                  "text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0",
                  active
                    ? "bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border border-[var(--color-accent)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                )}
              >
                <tab.icon
                  size={14}
                  className={active ? "text-[var(--color-accent)]" : ""}
                />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Page content ───────────────────────────────────────────────── */}
      <Outlet />
    </div>
  );
}
