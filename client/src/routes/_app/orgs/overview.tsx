// ==================== src/routes/_app/orgs/overview.tsx ====================
import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2, Users, FolderKanban, Calendar,
  Edit2, Trash2, Check, X,
} from "lucide-react";
import { toast } from "sonner";

import { useOrgStore }  from "@/store/org.store";
import { updateOrgSchema, type UpdateOrgFormValues } from "@/lib/validators";
import { ORG_ROLES_ADMIN, ORG_ROLES_OWNER } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Button }     from "@/components/ui/button";
import { Input }      from "@/components/ui/input";
import { RoleGuard }  from "@/components/shared/RoleGuard";
import { StatsCard }  from "@/components/shared/StatsCard";

// ─── Inline edit name ────────────────────────────────────────────────────────
function InlineEditName() {
  const { orgId } = useParams<{ orgId: string }>();
  const { activeOrg, updateOrg, status } = useOrgStore();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UpdateOrgFormValues>({
      resolver: zodResolver(updateOrgSchema),
      defaultValues: { name: activeOrg?.name ?? "" },
    });

  const onSubmit = async (values: UpdateOrgFormValues) => {
    if (!orgId || !values.name) return;
    const ok = await updateOrg(orgId, { name: values.name });
    if (ok) { toast.success("Organization name updated"); setEditing(false); }
    else     toast.error(status.updateOrg.error ?? "Update failed");
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-text-primary)]">{activeOrg?.name}</span>
        <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
          <button
            onClick={() => { reset({ name: activeOrg?.name }); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)] transition-all"
          >
            <Edit2 size={12} />
          </button>
        </RoleGuard>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2">
      <Input
        {...register("name")}
        className="h-8 py-1 text-sm"
        autoFocus
        error={errors.name?.message}
      />
      <button type="submit" disabled={status.updateOrg.loading}
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
function DeleteOrgDialog({ onClose }: { onClose: () => void }) {
  const { orgId }  = useParams<{ orgId: string }>();
  const navigate   = useNavigate();
  const { activeOrg, deleteOrg, status } = useOrgStore();
  const [confirm, setConfirm] = useState("");
  const match     = confirm === activeOrg?.name;

  const handleDelete = async () => {
    if (!orgId || !match) return;
    const ok = await deleteOrg(orgId);
    if (ok) {
      toast.success("Organization deleted");
      navigate("/dashboard");
    } else {
      toast.error(status.deleteOrg.error ?? "Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-scale-in space-y-5">
        <div className="space-y-1">
          <h3 className="font-display text-lg font-bold text-red-400">Delete Organization</h3>
          <p className="text-sm text-[var(--color-text-muted)]">
            This will permanently delete <span className="font-semibold text-[var(--color-text-secondary)]">{activeOrg?.name}</span> and
            all its memberships. This action <span className="text-red-400 font-medium">cannot be undone</span>.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="section-label">
            Type <span className="font-mono text-[var(--color-text-secondary)]">{activeOrg?.name}</span> to confirm
          </label>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={activeOrg?.name}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!match}
            loading={status.deleteOrg.loading}
            onClick={handleDelete}
          >
            Delete permanently
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function OrgOverviewPage() {
  const { activeOrg, members } = useOrgStore();
  const [showDelete, setShowDelete] = useState(false);

  if (!activeOrg) return null;

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard label="Members"  value={members.length} icon={Users}        accent="#38bdf8" />
        <StatsCard label="Projects" value="—"              icon={FolderKanban} accent="#22c55e" />
        <StatsCard label="Created"  value={formatDate(activeOrg.createdAt)} icon={Calendar} accent="var(--color-accent)" />
      </div>

      {/* Details card */}
      <div className="card divide-y divide-[var(--color-border)]">
        <div className="px-6 py-4">
          <p className="section-label mb-4">Organization Details</p>
          <dl className="space-y-4">

            {[
              {
                label: "Name",
                value: <InlineEditName />,
              },
              {
                label: "Slug",
                value: (
                  <span className="font-mono text-sm text-[var(--color-text-secondary)]">
                    /{activeOrg.slug}
                  </span>
                ),
              },
              {
                label: "Organization ID",
                value: (
                  <span className="font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] select-all">
                    {activeOrg._id}
                  </span>
                ),
              },
              {
                label: "Created",
                value: <span className="text-sm text-[var(--color-text-secondary)]">{formatDate(activeOrg.createdAt)}</span>,
              },
              {
                label: "Last updated",
                value: <span className="text-sm text-[var(--color-text-secondary)]">{formatDate(activeOrg.updatedAt)}</span>,
              },
            ].map(({ label, value }) => (
              <div key={label} className="group flex items-center justify-between gap-4">
                <dt className="w-32 flex-shrink-0 text-xs font-medium text-[var(--color-text-muted)]">
                  {label}
                </dt>
                <dd className="flex-1">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Danger zone — owner only */}
      <RoleGuard requiredRoles={ORG_ROLES_OWNER}>
        <div className={cn(
          "rounded-[var(--radius-lg)] border border-red-500/20 p-6 space-y-4",
          "bg-red-500/5"
        )}>
          <div>
            <p className="font-display text-sm font-bold text-red-400">Danger Zone</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Irreversible actions that affect the entire organization.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-red-500/15 bg-[var(--color-surface)] p-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Delete this organization</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Permanently deletes the org and all memberships.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>
      </RoleGuard>

      {showDelete && <DeleteOrgDialog onClose={() => setShowDelete(false)} />}
    </div>
  );
}
