// ==================== src/routes/_app/dashboard.tsx ====================
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Building2, FolderKanban, Users, Plus,
  ArrowRight, Shield, Activity, Zap,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { Button }       from "@/components/ui/button";
import { StatsCard }    from "@/components/shared/StatsCard";
import { RoleBadge }    from "@/components/shared/index";
import { cn, formatDate, getInitials, truncate } from "@/lib/utils";

// ─── Quick-action card ────────────────────────────────────────────────────────
function QuickAction({
  icon: Icon, label, desc, to, accent,
}: {
  icon: React.ElementType; label: string; desc: string; to: string; accent: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "card group flex items-start gap-4 p-5",
        "hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow)]",
        "transition-all duration-200"
      )}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
        style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{desc}</p>
      </div>
      <ArrowRight
        size={15}
        className="mt-0.5 flex-shrink-0 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}

// ─── Org card ─────────────────────────────────────────────────────────────────
function OrgCard({ org }: { org: ReturnType<typeof useOrgStore>["orgs"][0] }) {
  const navigate = useNavigate();
  const { setActiveOrg } = useOrgStore();

  return (
    <button
      onClick={() => { setActiveOrg(org); navigate(`/orgs/${org._id}/overview`); }}
      className={cn(
        "card group flex w-full items-center gap-4 p-4 text-left",
        "hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow)]",
        "transition-all duration-200"
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-sm font-bold">
        {getInitials(org.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-display text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {org.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">/{org.slug}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-xs text-[var(--color-text-muted)]">{formatDate(org.createdAt)}</p>
        <ArrowRight
          size={14}
          className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user }               = useAuthStore();
  const { orgs, activeOrg, userMembership } = useOrgStore();

  // Get hour for greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  const firstName = user?.fullName?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-10 animate-slide-up">

      {/* ── Hero greeting ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm text-[var(--color-text-muted)]">{greeting},</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {firstName} 👋
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Here's what's happening across your organizations.
          </p>
        </div>

        <Link to="/orgs/new">
          <Button size="sm" className="gap-2">
            <Plus size={14} />
            New Organization
          </Button>
        </Link>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────── */}
      <div>
        <p className="section-label mb-3">Overview</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Organizations"
            value={orgs.length}
            icon={Building2}
            accent="var(--color-accent)"
          />
          <StatsCard
            label="Projects"
            value="—"
            icon={FolderKanban}
            accent="#22c55e"
          />
          <StatsCard
            label="Team Members"
            value="—"
            icon={Users}
            accent="#38bdf8"
          />
          <StatsCard
            label="Active Sessions"
            value="—"
            icon={Activity}
            accent="#f59e0b"
          />
        </div>
      </div>

      {/* ── Two-col content ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Organizations list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Your Organizations</p>
            <Link to="/orgs/new" className="text-xs text-[var(--color-accent)] hover:underline">
              + New
            </Link>
          </div>

          {orgs.length === 0 ? (
            <div className={cn(
              "card flex flex-col items-center justify-center py-14 text-center",
            )}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
                <Building2 size={22} className="text-[var(--color-text-muted)]" />
              </div>
              <p className="font-display text-base font-semibold">No organizations yet</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Create your first organization to get started
              </p>
              <Link to="/orgs/new" className="mt-5">
                <Button size="sm">
                  <Plus size={13} />
                  Create Organization
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orgs.map((org) => (
                <OrgCard key={org._id} org={org} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Active org context */}
          {activeOrg && userMembership && (
            <div>
              <p className="section-label mb-3">Active Organization</p>
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-sm font-bold">
                    {getInitials(activeOrg.name)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold">{activeOrg.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">/{activeOrg.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)]">
                  <Shield size={12} className="text-[var(--color-text-muted)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Your role</span>
                  <RoleBadge role={userMembership.role} />
                </div>
                <Link to={`/orgs/${activeOrg._id}/overview`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    View Organization
                    <ArrowRight size={13} />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <p className="section-label mb-3">Quick Actions</p>
            <div className="space-y-2">
              <QuickAction
                icon={Building2}
                label="New Organization"
                desc="Create a workspace for your team"
                to="/orgs/new"
                accent="var(--color-accent)"
              />
              <QuickAction
                icon={Shield}
                label="Manage Sessions"
                desc="View and revoke active sessions"
                to="/account/sessions"
                accent="#f59e0b"
              />
              <QuickAction
                icon={Zap}
                label="Security Settings"
                desc="Update your password"
                to="/account/security"
                accent="#22c55e"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
