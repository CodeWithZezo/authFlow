// ==================== src/routes/_app/account/profile.tsx ====================
import { useEffect } from "react";
import { Mail, Phone, Shield, User, CheckCircle2, Clock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { getInitials, cn } from "@/lib/utils";
import { RoleBadge }    from "@/components/shared/index";
import { Spinner }      from "@/components/shared/index";

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({
  icon: Icon, label, value, mono,
}: {
  icon: React.ElementType; label: string; value?: string | null; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border)] last:border-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <Icon size={14} className="text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className={cn(
          "mt-0.5 text-sm text-[var(--color-text-primary)] truncate",
          mono && "font-mono text-xs"
        )}>
          {value ?? <span className="italic text-[var(--color-text-muted)]">Not set</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, fetchMe, status } = useAuthStore();
  const { orgs, activeOrg, userMembership } = useOrgStore();

  useEffect(() => {
    // Refresh user data on mount
    fetchMe();
  }, []);

  if (status.fetchMe.loading && !user) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-5 animate-slide-up">

      {/* ── Avatar card ──────────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          {/* Big avatar */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl",
              "bg-gradient-to-br from-[var(--color-accent)] to-violet-600",
              "text-white text-2xl font-bold font-display shadow-[var(--shadow-glow)]"
            )}>
              {getInitials(user.fullName)}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
                <CheckCircle2 size={14} className="text-green-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold tracking-tight truncate">
              {user.fullName}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">{user.email}</p>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {user.isVerified ? (
                <span className="badge border text-xs text-green-400 bg-green-400/10 border-green-400/20">
                  Verified
                </span>
              ) : (
                <span className="badge border text-xs text-amber-400 bg-amber-400/10 border-amber-400/20">
                  Unverified
                </span>
              )}
              {activeOrg && userMembership && (
                <RoleBadge role={userMembership.role} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal info ────────────────────────────────────────────────── */}
      <div className="card px-6 py-2">
        <p className="section-label py-4 border-b border-[var(--color-border)]">Personal Information</p>
        <InfoRow icon={User}   label="Full name"   value={user.fullName} />
        <InfoRow icon={Mail}   label="Email"       value={user.email}    />
        <InfoRow icon={Phone}  label="Phone"       value={user.phone}    />
        <InfoRow icon={Shield} label="User ID"     value={user.id}       mono />
      </div>

      {/* ── Organization memberships ─────────────────────────────────────── */}
      {orgs.length > 0 && (
        <div className="card px-6 py-2">
          <p className="section-label py-4 border-b border-[var(--color-border)]">
            Organizations ({orgs.length})
          </p>
          {orgs.map((org) => (
            <div key={org._id} className="flex items-center gap-3 py-3.5 border-b border-[var(--color-border)] last:border-0">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-xs font-bold">
                {getInitials(org.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{org.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">/{org.slug}</p>
              </div>
              {activeOrg?._id === org._id && userMembership && (
                <RoleBadge role={userMembership.role} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Account notice ─────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
        <Clock size={14} className="mt-0.5 flex-shrink-0 text-[var(--color-text-muted)]" />
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          To update your name, email, or phone number, contact your administrator or use the API directly. Profile editing UI is coming soon.
        </p>
      </div>

    </div>
  );
}
