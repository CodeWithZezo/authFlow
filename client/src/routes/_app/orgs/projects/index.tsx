// ==================== src/routes/_app/orgs/projects/index.tsx ====================
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Plus, FolderKanban, Users, Calendar, Search, ArrowRight } from "lucide-react";

import { useProjectStore } from "@/store/project.store";
import { useOrgStore }     from "@/store/org.store";
import { cn, formatDate, getInitials, truncate } from "@/lib/utils";
import { type Project, Status, ORG_ROLES_ADMIN } from "@/types";
import { Button }        from "@/components/ui/button";
import { Input }         from "@/components/ui/input";
import { StatusBadge, EmptyState } from "@/components/shared/index";
import { RoleGuard }     from "@/components/shared/RoleGuard";

// ─── Status filter pill ───────────────────────────────────────────────────────
const STATUS_FILTERS = ["all", Status.ACTIVE, Status.INACTIVE, Status.PENDING, Status.SUSPENDED] as const;
type Filter = typeof STATUS_FILTERS[number];

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-[var(--radius)] text-xs font-medium transition-all capitalize",
        active
          ? "bg-[var(--color-accent-dim)] text-[var(--color-text-primary)] border border-[var(--color-accent)]/20"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)]"
      )}
    >
      {label}
    </button>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const { orgId } = useParams<{ orgId: string }>();
  const { setActiveProject } = useProjectStore();

  const gradients: Record<string, string> = {
    active:    "from-emerald-500 to-teal-600",
    inactive:  "from-gray-500 to-gray-600",
    pending:   "from-amber-500 to-orange-600",
    suspended: "from-red-500 to-rose-600",
  };

  return (
    <div
      className={cn(
        "card group flex flex-col gap-4 p-5 cursor-pointer",
        "hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow)]",
        "transition-all duration-200"
      )}
      onClick={() => {
        setActiveProject(project);
        navigate(`/orgs/${orgId}/projects/${project._id}/overview`);
      }}
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-br text-white text-base font-bold shadow-sm",
          "transition-transform group-hover:scale-105",
          gradients[project.status] ?? "from-[var(--color-accent)] to-violet-600"
        )}>
          {getInitials(project.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-bold text-[var(--color-text-primary)] truncate">
            {project.name}
          </p>
          <StatusBadge status={project.status} />
        </div>

        <ArrowRight
          size={16}
          className="flex-shrink-0 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
          {truncate(project.description, 120)}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-3 mt-auto">
        <span className="flex items-center gap-1.5">
          <Calendar size={11} />
          {formatDate(project.createdAt)}
        </span>
        <span className="font-mono text-[10px] opacity-60">{project._id.slice(-6)}</span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProjectsListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { projects, fetchProjects, status } = useProjectStore();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<Filter>("all");

  useEffect(() => {
    if (orgId) fetchProjects(orgId);
  }, [orgId]);

  const filtered = projects.filter((p) => {
    const matchSearch = !search || [p.name, p.description].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5 animate-slide-up">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 h-9 w-48"
            />
          </div>
          {/* Status filters */}
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((f) => (
              <FilterPill
                key={f}
                label={f}
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
          <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
            <Link to={`/orgs/${orgId}/projects/new`}>
              <Button size="sm">
                <Plus size={14} />
                New Project
              </Button>
            </Link>
          </RoleGuard>
        </div>
      </div>

      {/* Loading skeleton */}
      {status.fetchProjects.loading && projects.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-[var(--color-surface-3)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded-full bg-[var(--color-surface-3)]" />
                  <div className="h-3 w-16 rounded-full bg-[var(--color-surface-3)]" />
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-[var(--color-surface-3)]" />
              <div className="h-3 w-3/4 rounded-full bg-[var(--color-surface-3)]" />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {!status.fetchProjects.loading && filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search || filter !== "all" ? "No projects match" : "No projects yet"}
          description={
            search || filter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"
          }
          action={
            !search && filter === "all" ? (
              <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
                <Link to={`/orgs/${orgId}/projects/new`}>
                  <Button size="sm">
                    <Plus size={13} />
                    New Project
                  </Button>
                </Link>
              </RoleGuard>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
