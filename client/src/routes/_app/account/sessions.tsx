// ==================== src/routes/_app/account/sessions.tsx ====================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  MonitorSmartphone, Trash2, ShieldAlert,
  Clock, LogOut, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { useSessionStore } from "@/store/session.store";
import { useAuthStore }    from "@/store/auth.store";
import { timeAgo, formatDateTime, cn } from "@/lib/utils";
import { Button }   from "@/components/ui/button";
import { Spinner }  from "@/components/shared/index";
import type { Session } from "@/types";

// ─── Session card ─────────────────────────────────────────────────────────────
function SessionCard({
  session,
  isCurrent,
  onRevoke,
  revoking,
}: {
  session:   Session;
  isCurrent: boolean;
  onRevoke:  (id: string) => void;
  revoking:  boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-4 rounded-[var(--radius-lg)] border p-4 transition-all",
      isCurrent
        ? "border-[var(--color-accent)]/30 bg-[var(--color-accent-dim)]"
        : "border-[var(--color-border)] bg-[var(--color-surface-2)] hover:border-[var(--color-border-2)]"
    )}>
      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
        isCurrent
          ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow)]"
          : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
      )}>
        <MonitorSmartphone size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            Browser Session
          </p>
          {isCurrent && (
            <span className="badge border text-xs text-[var(--color-accent)] bg-[var(--color-accent-dim)] border-[var(--color-accent)]/30">
              Current
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] flex-wrap">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            Created {timeAgo(session.createdAt)}
          </span>
          <span>·</span>
          <span>Last active {timeAgo(session.updatedAt)}</span>
        </div>

        <p className="font-mono text-[10px] text-[var(--color-text-muted)] opacity-60 select-all">
          {session._id}
        </p>
      </div>

      {/* Revoke button — hide on current */}
      {!isCurrent && (
        <button
          onClick={() => onRevoke(session._id)}
          disabled={revoking}
          title="Revoke this session"
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            "text-[var(--color-text-muted)] hover:text-red-400",
            "hover:bg-red-500/10 border border-transparent hover:border-red-500/20",
            "transition-all duration-150 disabled:opacity-40"
          )}
        >
          {revoking
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            : <Trash2 size={14} />
          }
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, fetchSessions, revokeSession, revokeAll, status } = useSessionStore();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [showRevokeAll, setShowRevokeAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Guess which session is current — most recently updated one
  const currentSessionId = sessions.length > 0
    ? [...sessions].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]._id
    : null;

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    const ok = await revokeSession(id);
    setRevokingId(null);
    if (ok) toast.success("Session revoked");
    else    toast.error(status.revokeSession.error ?? "Failed to revoke session");
  };

  const handleRevokeAll = async () => {
    const ok = await revokeAll();
    if (ok) {
      toast.success("All sessions revoked — signing you out");
      navigate("/login");
    } else {
      toast.error(status.revokeAll.error ?? "Failed");
    }
  };

  const loading = status.fetchSessions.loading;
  const otherSessions = sessions.filter((s) => s._id !== currentSessionId);

  return (
    <div className="max-w-xl space-y-5 animate-slide-up">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold">Active Sessions</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {sessions.length} {sessions.length === 1 ? "session" : "sessions"} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => fetchSessions()}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
          {sessions.length > 1 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRevokeAll(true)}
            >
              <LogOut size={13} />
              Revoke All
            </Button>
          )}
        </div>
      </div>

      {/* Sessions list */}
      {loading && sessions.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size={22} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-14 text-center">
          <MonitorSmartphone size={28} className="mb-3 text-[var(--color-text-muted)]" />
          <p className="font-display text-base font-semibold">No active sessions</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">You'll see sessions here once you log in.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current session first */}
          {sessions
            .filter((s) => s._id === currentSessionId)
            .map((s) => (
              <SessionCard
                key={s._id}
                session={s}
                isCurrent
                onRevoke={handleRevoke}
                revoking={revokingId === s._id}
              />
            ))}

          {/* Other sessions */}
          {otherSessions.length > 0 && (
            <>
              {otherSessions.length > 0 && (
                <p className="section-label px-1 pt-2">Other Sessions</p>
              )}
              {otherSessions.map((s) => (
                <SessionCard
                  key={s._id}
                  session={s}
                  isCurrent={false}
                  onRevoke={handleRevoke}
                  revoking={revokingId === s._id}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Security tip */}
      <div className="flex items-start gap-3 rounded-[var(--radius)] border border-amber-500/20 bg-amber-500/5 p-4">
        <ShieldAlert size={14} className="mt-0.5 flex-shrink-0 text-amber-400" />
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          If you see a session you don't recognize, revoke it immediately and change your password in the Security tab.
        </p>
      </div>

      {/* Revoke all confirm modal */}
      {showRevokeAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-sm p-6 animate-scale-in space-y-5">
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-red-400">Revoke All Sessions</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                This will sign you out from <span className="font-semibold text-[var(--color-text-secondary)]">all devices</span>, including this one. You'll need to log in again.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowRevokeAll(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                loading={status.revokeAll.loading}
                onClick={handleRevokeAll}
              >
                Sign out all
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
