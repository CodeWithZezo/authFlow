// ==================== src/routes/_app/orgs/projects/overview.tsx ====================
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users, Calendar, Clock, Shield, KeyRound,
  Edit2, Check, X, Trash2, ArrowRight,
  Copy, RefreshCw, Terminal,
} from "lucide-react";
import { toast } from "sonner";

import { useProjectStore } from "@/store/project.store";
import { updateProjectSchema, type UpdateProjectFormValues } from "@/lib/validators";
import { PROJ_ROLES_ADMIN, Status } from "@/types";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { StatsCard }   from "@/components/shared/StatsCard";
import { StatusBadge } from "@/components/shared/index";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

// ─── Inline name edit ────────────────────────────────────────────────────────
function InlineEditName() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const { activeProject, updateProject, status } = useProjectStore();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UpdateProjectFormValues>({
      resolver: zodResolver(updateProjectSchema),
      defaultValues: { name: activeProject?.name ?? "" },
    });

  const onSubmit = async (values: UpdateProjectFormValues) => {
    if (!orgId || !projectId || !values.name) return;
    const ok = await updateProject(orgId, projectId, { name: values.name });
    if (ok) { toast.success("Name updated"); setEditing(false); }
    else     toast.error(status.updateProject.error ?? "Update failed");
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2 group/edit">
        <span className="text-sm text-[var(--color-text-primary)]">{activeProject?.name}</span>
        <button
          onClick={() => { reset({ name: activeProject?.name }); setEditing(true); }}
          className="opacity-0 group-hover/edit:opacity-100 flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] transition-all"
        >
          <Edit2 size={12} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
      <Input {...register("name")} className="h-8 py-1 text-sm" autoFocus error={errors.name?.message} />
      <button type="submit" disabled={status.updateProject.loading}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors">
        <Check size={13} />
      </button>
      <button type="button" onClick={() => setEditing(false)}
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
        <X size={13} />
      </button>
    </form>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────
function DeleteProjectDialog({ onClose }: { onClose: () => void }) {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const { activeProject, deleteProject, status } = useProjectStore();
  const [confirm, setConfirm] = useState("");
  const match = confirm === activeProject?.name;

  const handleDelete = async () => {
    if (!orgId || !projectId || !match) return;
    const ok = await deleteProject(orgId, projectId);
    if (ok) { toast.success("Project deleted"); navigate(`/orgs/${orgId}/projects`); }
    else     toast.error(status.deleteProject.error ?? "Delete failed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-scale-in space-y-5">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-red-400">Delete Project</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            This will permanently delete{" "}
            <span className="font-semibold text-[var(--color-text-secondary)]">{activeProject?.name}</span>{" "}
            and all its members. This action <span className="text-red-400 font-medium">cannot be undone</span>.
          </p>
        </div>
        <div className="space-y-1.5">
          <label className="section-label">
            Type <span className="font-mono text-[var(--color-text-secondary)]">{activeProject?.name}</span> to confirm
          </label>
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={activeProject?.name} autoFocus />
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className="flex-1" disabled={!match} loading={status.deleteProject.loading} onClick={handleDelete}>
            Delete permanently
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── API Key card ─────────────────────────────────────────────────────────────
function ApiKeyCard({ projectId }: { projectId: string }) {
  const { getApiKey, status } = useProjectStore();
  const [apiUrl, setApiUrl]   = useState<string | null>(null);
  const [copied, setCopied]   = useState(false);

  const handleReveal = async () => {
    if (apiUrl) return; // already loaded
    const url = await getApiKey(projectId);
    if (url) setApiUrl(url);
    else     toast.error(status.getApiKey.error ?? "Failed to load API endpoint");
  };

  const handleCopy = async () => {
    if (!apiUrl) return;
    await navigator.clipboard.writeText(apiUrl);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
          <Terminal size={16} className="text-amber-400" />
        </div>
        <div>
          <p className="font-display text-sm font-bold">End-User API Endpoint</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Use this base URL to authenticate your app's end users
          </p>
        </div>
      </div>

      {/* URL display / reveal */}
      {apiUrl ? (
        <div className="space-y-2">
          <div className={cn(
            "flex items-center gap-2 rounded-[var(--radius)] border border-[var(--color-border)]",
            "bg-[var(--color-surface-2)] px-3 py-2.5"
          )}>
            <code className="flex-1 truncate font-mono text-xs text-[var(--color-text-secondary)]">
              {apiUrl}
            </code>
            <button
              onClick={handleCopy}
              title="Copy URL"
              className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors",
                copied
                  ? "text-green-400"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
              )}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">
              Append <code className="font-mono text-[var(--color-accent)]">/signup</code> or{" "}
              <code className="font-mono text-[var(--color-accent)]">/login</code> to this URL
            </p>
            <button
              onClick={() => setApiUrl(null)}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors flex items-center gap-1"
            >
              <RefreshCw size={11} /> Refresh
            </button>
          </div>
        </div>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReveal}
          loading={status.getApiKey.loading}
          className="w-full"
        >
          <Terminal size={13} />
          Reveal API Endpoint
        </Button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProjectOverviewPage() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const { activeProject, members, updateProject, status } = useProjectStore();
  const [showDelete, setShowDelete] = useState(false);

  if (!activeProject) return null;

  const isAdmin = useProjectStore.getState().userMembership
    ? PROJ_ROLES_ADMIN.includes(useProjectStore.getState().userMembership!.role)
    : false;

  const handleStatusChange = async (s: string) => {
    if (!orgId || !projectId) return;
    const ok = await updateProject(orgId, projectId, { status: s as Status });
    if (ok) toast.success("Status updated");
    else    toast.error(status.updateProject.error ?? "Failed");
  };

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="Members"  value={members.length}                    icon={Users}    accent="#38bdf8" />
        <StatsCard label="Status"   value={activeProject.status}              icon={Shield}   accent="#22c55e" />
        <StatsCard label="Created"  value={formatDate(activeProject.createdAt)} icon={Calendar} accent="var(--color-accent)" />
        <StatsCard label="Updated"  value={formatDate(activeProject.updatedAt)} icon={Clock}    accent="#f59e0b" />
      </div>

      {/* Details card */}
      <div className="card divide-y divide-[var(--color-border)]">
        <div className="px-6 py-5">
          <p className="section-label mb-4">Project Details</p>
          <dl className="space-y-4">
            {[
              { label: "Name",        value: <InlineEditName /> },
              {
                label: "Status",
                value: isAdmin ? (
                  <Select value={activeProject.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-36 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Status).map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : <StatusBadge status={activeProject.status} />,
              },
              {
                label: "Description",
                value: activeProject.description
                  ? <span className="text-sm text-[var(--color-text-secondary)]">{activeProject.description}</span>
                  : <span className="text-sm text-[var(--color-text-muted)] italic">No description</span>,
              },
              {
                label: "Project ID",
                value: (
                  <span className="font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] select-all">
                    {activeProject._id}
                  </span>
                ),
              },
              {
                label: "Created",
                value: <span className="text-sm text-[var(--color-text-secondary)]">{formatDateTime(activeProject.createdAt)}</span>,
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4">
                <dt className="w-28 flex-shrink-0 text-xs font-medium text-[var(--color-text-muted)]">{label}</dt>
                <dd className="flex-1">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: "Project Policy",   desc: "Auth rules and access control",    path: "policy",           icon: Shield,  accent: "#6c63ff" },
          { label: "Password Policy",  desc: "Password strength requirements",   path: "password-policy",  icon: KeyRound, accent: "#22c55e" },
        ].map(({ label, desc, path, icon: Icon, accent }) => (
          <a
            key={path}
            href={`/orgs/${orgId}/projects/${projectId}/${path}`}
            className={cn(
              "card group flex items-center gap-4 p-4",
              "hover:border-[var(--color-border-2)] hover:shadow-[var(--shadow)]",
              "transition-all duration-200"
            )}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)` }}
            >
              <Icon size={16} style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{desc}</p>
            </div>
            <ArrowRight size={14} className="flex-shrink-0 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-all" />
          </a>
        ))}
      </div>

      {/* API Endpoint */}
      <ApiKeyCard projectId={projectId!} />

      {/* Danger zone — manager only */}
      {isAdmin && (
        <div className="rounded-[var(--radius-lg)] border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <div>
            <p className="font-display text-sm font-bold text-red-400">Danger Zone</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Irreversible actions.</p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-red-500/15 bg-[var(--color-surface)] p-4">
            <div>
              <p className="text-sm font-medium">Delete this project</p>
              <p className="text-xs text-[var(--color-text-muted)]">Removes all members and policies.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>
      )}

      {showDelete && <DeleteProjectDialog onClose={() => setShowDelete(false)} />}
    </div>
  );
}
