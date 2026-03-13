// ==================== src/routes/_app/orgs/members.tsx ====================
import { useState } from "react";
import { useParams } from "react-router";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus, Search, MoreHorizontal,
  ShieldCheck, ShieldOff, Trash2, X, Users,
} from "lucide-react";
import { toast } from "sonner";

import { useOrgStore }   from "@/store/org.store";
import { useAuthStore }  from "@/store/auth.store";
import {
  addOrgMemberSchema, type AddOrgMemberFormValues,
} from "@/lib/validators";
import {
  Role, Status, type OrgMembership, type PopulatedUser,
  ORG_ROLES_ADMIN,
} from "@/types";
import { cn, getInitials, timeAgo } from "@/lib/utils";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { RoleGuard }    from "@/components/shared/RoleGuard";
import { RoleBadge, StatusBadge, EmptyState } from "@/components/shared/index";

// ─── Add member modal ────────────────────────────────────────────────────────
function AddMemberModal({ onClose }: { onClose: () => void }) {
  const { orgId }  = useParams<{ orgId: string }>();
  const { addMember, status } = useOrgStore();

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<AddOrgMemberFormValues>({
    resolver: zodResolver(addOrgMemberSchema),
    defaultValues: { userId: "", role: Role.MEMBER },
  });

  const role = watch("role");

  const onSubmit = async (values: AddOrgMemberFormValues) => {
    if (!orgId) return;
    const ok = await addMember(orgId, values);
    if (ok) { toast.success("Member added"); onClose(); }
    else     toast.error(status.addMember.error ?? "Failed to add member");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-scale-in space-y-5">

        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Add Member</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          <div className="space-y-1.5">
            <label className="section-label">User ID <span className="text-[var(--color-accent)]">*</span></label>
            <Input
              {...register("userId")}
              placeholder="64f1a2b3c4d5e6f7a8b9c0d1"
              autoFocus
              error={errors.userId?.message}
              className="font-mono text-xs"
            />
            {errors.userId && <p className="text-xs text-red-400">{errors.userId.message}</p>}
            <p className="text-xs text-[var(--color-text-muted)]">
              Paste the MongoDB ObjectId of the user to invite.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Role</label>
            <Select value={role} onValueChange={(v) => setValue("role", v as Role)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {[Role.MEMBER, Role.ADMIN, Role.OWNER].map((r) => (
                  <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status.addMember.error && (
            <p className="text-xs text-red-400">{status.addMember.error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" type="button" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={isSubmitting || status.addMember.loading}>
              Add Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Row actions menu ─────────────────────────────────────────────────────────
function MemberRowMenu({
  membership, currentUserId, onClose,
}: {
  membership: OrgMembership;
  currentUserId: string;
  onClose: () => void;
}) {
  const { orgId } = useParams<{ orgId: string }>();
  const { updateMember, removeMember, status } = useOrgStore();

  const userId = typeof membership.userId === "string"
    ? membership.userId
    : membership.userId._id;

  const isSelf = userId === currentUserId;

  const handleRole = async (role: Role) => {
    if (!orgId) return;
    const ok = await updateMember(orgId, userId, { role });
    if (ok) { toast.success("Role updated"); onClose(); }
    else     toast.error(status.updateMember.error ?? "Failed");
  };

  const handleStatus = async (s: Status) => {
    if (!orgId) return;
    const ok = await updateMember(orgId, userId, { status: s });
    if (ok) { toast.success("Status updated"); onClose(); }
    else     toast.error(status.updateMember.error ?? "Failed");
  };

  const handleRemove = async () => {
    if (!orgId) return;
    const ok = await removeMember(orgId, userId);
    if (ok) { toast.success("Member removed"); onClose(); }
    else     toast.error(status.removeMember.error ?? "Failed");
  };

  return (
    <div className={cn(
      "absolute right-0 top-8 z-20 w-48",
      "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)]",
      "shadow-[var(--shadow-lg)] animate-scale-in p-1"
    )}>
      <p className="section-label px-2 py-1.5">Change role</p>
      {[Role.MEMBER, Role.ADMIN, Role.OWNER].map((r) => (
        <button key={r} onClick={() => handleRole(r)}
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5",
            "text-sm capitalize transition-colors",
            membership.role === r
              ? "text-[var(--color-accent)] bg-[var(--color-accent-dim)]"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
          )}>
          <ShieldCheck size={13} />
          {r}
        </button>
      ))}

      <div className="my-1 h-px bg-[var(--color-border)]" />
      <p className="section-label px-2 py-1.5">Change status</p>
      {[Status.ACTIVE, Status.INACTIVE, Status.SUSPENDED].map((s) => (
        <button key={s} onClick={() => handleStatus(s)}
          className={cn(
            "flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5",
            "text-sm capitalize text-[var(--color-text-secondary)]",
            "hover:bg-[var(--color-surface-3)] transition-colors"
          )}>
          <ShieldOff size={13} />
          {s}
        </button>
      ))}

      {!isSelf && (
        <>
          <div className="my-1 h-px bg-[var(--color-border)]" />
          <button onClick={handleRemove}
            className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={13} />
            Remove member
          </button>
        </>
      )}
    </div>
  );
}

// ─── Member row ───────────────────────────────────────────────────────────────
function MemberRow({
  membership, currentUserId,
}: {
  membership: OrgMembership;
  currentUserId: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const user = typeof membership.userId === "object"
    ? (membership.userId as PopulatedUser)
    : null;

  const displayName  = user?.fullName ?? "Unknown user";
  const displayEmail = user?.email    ?? "";
  const userId       = user?._id ?? (membership.userId as string);
  const isSelf       = userId === currentUserId;

  return (
    <tr className="group border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)] transition-colors">
      {/* User */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-accent)] to-violet-600 text-white text-xs font-bold">
            {getInitials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {displayName}
              {isSelf && (
                <span className="ml-2 text-xs text-[var(--color-text-muted)]">(you)</span>
              )}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{displayEmail}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5">
        <RoleBadge role={membership.role} />
      </td>

      {/* Status */}
      <td className="px-5 py-3.5">
        <StatusBadge status={membership.status} />
      </td>

      {/* Joined */}
      <td className="px-5 py-3.5 text-xs text-[var(--color-text-muted)]">
        {timeAgo(membership.createdAt)}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
          <div className="relative flex justify-end">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg",
                "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                "hover:bg-[var(--color-surface-3)] transition-all",
                "opacity-0 group-hover:opacity-100"
              )}
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <MemberRowMenu
                  membership={membership}
                  currentUserId={currentUserId}
                  onClose={() => setMenuOpen(false)}
                />
              </>
            )}
          </div>
        </RoleGuard>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function OrgMembersPage() {
  const { members, status } = useOrgStore();
  const { user }            = useAuthStore();
  const [showAdd, setShowAdd]   = useState(false);
  const [search, setSearch]     = useState("");

  const filtered = members.filter((m) => {
    if (!search) return true;
    const u = typeof m.userId === "object" ? m.userId as PopulatedUser : null;
    const str = [u?.fullName, u?.email, m.role, m.status].join(" ").toLowerCase();
    return str.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4 animate-slide-up">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            {members.length} {members.length === 1 ? "member" : "members"}
          </span>
          <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <UserPlus size={14} />
              Add Member
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No members match" : "No members yet"}
            description={search ? `No results for "${search}"` : "Add members to get started"}
            action={
              !search
                ? <RoleGuard requiredRoles={ORG_ROLES_ADMIN}>
                    <Button size="sm" onClick={() => setShowAdd(true)}>
                      <UserPlus size={13} />
                      Add Member
                    </Button>
                  </RoleGuard>
                : undefined
            }
          />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-surface-2)]">
                {["Member", "Role", "Status", "Joined", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-medium text-[var(--color-text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <MemberRow key={m._id} membership={m} currentUserId={user?.id ?? ""} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && <AddMemberModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
