// ==================== src/layouts/ProjectLayout.tsx ====================
import { useEffect } from "react";
import { Outlet, useParams, useLocation, Link, useNavigate } from "react-router";
import {
  LayoutGrid, Users, Shield, KeyRound,
  Settings, ArrowLeft,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useProjectStore } from "@/store/project.store";
import { useOrgStore }     from "@/store/org.store";
import { useAuthStore }    from "@/store/auth.store";
import { StatusBadge, Spinner } from "@/components/shared/index";
import { PROJ_ROLES_ADMIN }     from "@/types";

const TABS = [
  { label: "Overview",        path: "overview",        icon: LayoutGrid },
  { label: "Members",         path: "members",         icon: Users      },
  { label: "Policy",          path: "policy",          icon: Shield     },
  { label: "Pwd Policy",      path: "password-policy", icon: KeyRound   },
  { label: "Settings",        path: "settings",        icon: Settings   },
] as const;

export function ProjectLayout() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useAuthStore();
  const { activeOrg } = useOrgStore();

  const {
    activeProject, members,
    fetchProject, fetchMembers,
    setUserMembership, status,
  } = useProjectStore();

  useEffect(() => {
    if (!orgId || !projectId) return;
    fetchProject(orgId, projectId);
    fetchMembers(projectId);
  }, [projectId, orgId]);

  useEffect(() => {
    if (!user || members.length === 0) return;
    const mine = members.find((m) => {
      const uid = typeof m.userId === "string" ? m.userId : m.userId._id;
      return uid === user.id;
    });
    setUserMembership(mine ?? null);
  }, [members, user]);

  if (status.fetchProject.loading && !activeProject) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="font-display text-lg font-semibold">Project not found</p>
        <button
          onClick={() => navigate(`/orgs/${orgId}/projects`)}
          className="text-sm text-[var(--color-accent)] hover:underline"
        >
          ← Back to projects
        </button>
      </div>
    );
  }

  const userMembership = useProjectStore.getState().userMembership;
  const isAdmin = userMembership
    ? PROJ_ROLES_ADMIN.includes(userMembership.role)
    : false;

  const activeTab = TABS.find((t) =>
    location.pathname.includes(`/projects/${projectId}/${t.path}`)
  )?.path;

  const statusColors: Record<string, string> = {
    active:    "from-emerald-500 to-teal-600",
    inactive:  "from-gray-500 to-gray-600",
    pending:   "from-amber-500 to-orange-600",
    suspended: "from-red-500 to-rose-600",
  };
  const gradientClass = statusColors[activeProject.status] ?? "from-[var(--color-accent)] to-violet-600";

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">

      {/* ── Project header card ─────────────────────────────────────────── */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-5">
          {/* Icon */}
          <div className={cn(
            "flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl",
            "bg-gradient-to-br text-white text-lg sm:text-xl font-bold shadow-[var(--shadow)]",
            gradientClass
          )}>
            {getInitials(activeProject.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate">
                {activeProject.name}
              </h1>
              <StatusBadge status={activeProject.status} />
            </div>
            {activeProject.description && (
              <p className="mt-1 text-sm text-[var(--color-text-muted)] line-clamp-2">
                {activeProject.description}
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              in{" "}
              <Link
                to={`/orgs/${orgId}/overview`}
                className="text-[var(--color-accent)] hover:underline"
              >
                {activeOrg?.name ?? orgId}
              </Link>
            </p>
          </div>

          <Link
            to={`/orgs/${orgId}/projects`}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors flex-shrink-0"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Projects</span>
          </Link>
        </div>

        {/* Tab bar — scrollable on mobile */}
        <div className="mt-4 sm:mt-5 flex gap-1 border-t border-[var(--color-border)] pt-3 sm:pt-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-none">
          {TABS.map((tab) => {
            if (tab.path === "settings" && !isAdmin) return null;
            const active = activeTab === tab.path;
            return (
              <Link
                key={tab.path}
                to={`/orgs/${orgId}/projects/${projectId}/${tab.path}`}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 rounded-[var(--radius)] px-2.5 sm:px-3 py-2",
                  "text-sm font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0",
                  active
                    ? "bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border border-[var(--color-accent)]/20"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
                )}
              >
                <tab.icon size={14} className={active ? "text-[var(--color-accent)]" : ""} />
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
