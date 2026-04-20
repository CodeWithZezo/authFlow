// ==================== src/routes/_app/account/profile.tsx ====================
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail, Phone, Shield, User, CheckCircle2,
  Camera, Trash2, Edit2, Save, X, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { useOrgStore }  from "@/store/org.store";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validators";
import { getInitials, cn } from "@/lib/utils";
import { RoleBadge, Spinner } from "@/components/shared/index";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";

// ─── Avatar widget ────────────────────────────────────────────────────────────
function AvatarWidget() {
  const { user, uploadAvatar, deleteAvatar, status } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const avatarSrc = preview ?? user?.avatarUrl ?? null;
  const uploading = status.uploadAvatar.loading;
  const deleting  = status.deleteAvatar.loading;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const ok = await uploadAvatar(file);
    if (ok) toast.success("Avatar updated");
    else    toast.error(status.uploadAvatar.error ?? "Upload failed");

    URL.revokeObjectURL(localUrl);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDelete = async () => {
    const ok = await deleteAvatar();
    if (ok) toast.success("Avatar removed");
    else    toast.error(status.deleteAvatar.error ?? "Failed to remove avatar");
  };

  return (
    <div className="relative flex-shrink-0 group">
      <div className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-[var(--color-accent)] to-violet-600 shadow-[var(--shadow-glow)]"
      )}>
        {avatarSrc ? (
          <img src={avatarSrc} alt={user?.fullName ?? "Avatar"} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white text-2xl font-bold font-display select-none">
            {getInitials(user?.fullName ?? "?")}
          </span>
        )}

        {(uploading || deleting) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
            <Spinner size={20} />
          </div>
        )}

        {!uploading && !deleting && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
            title="Change avatar"
          >
            <Camera size={16} className="text-white" />
            <span className="text-[10px] text-white font-medium">Change</span>
          </button>
        )}
      </div>

      {user?.isVerified && (
        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
          <CheckCircle2 size={14} className="text-green-400" />
        </div>
      )}

      {(user?.avatarUrl || preview) && !uploading && !deleting && (
        <button
          type="button"
          onClick={handleDelete}
          title="Remove avatar"
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-red-600 shadow"
        >
          <Trash2 size={9} />
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

// ─── Edit profile form ────────────────────────────────────────────────────────
function EditProfileForm({ onCancel }: { onCancel: () => void }) {
  const { user, updateProfile, status } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } =
    useForm<UpdateProfileFormValues>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { fullName: user?.fullName ?? "", phone: user?.phone ?? "" },
    });

  const onSubmit = async (values: UpdateProfileFormValues) => {
    const payload: { fullName?: string; phone?: string } = {};
    if (values.fullName) payload.fullName = values.fullName;
    if (values.phone)    payload.phone    = values.phone;
    const ok = await updateProfile(payload);
    if (ok) { toast.success("Profile updated"); onCancel(); }
    else    toast.error(status.updateProfile.error ?? "Update failed");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label className="section-label">Full name</label>
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input {...register("fullName")} placeholder="Your full name" className="pl-9" autoFocus />
        </div>
        {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="section-label">Phone</label>
        <div className="relative">
          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input {...register("phone")} placeholder="+1 555 000 0000" className="pl-9" />
        </div>
        {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
      </div>

      {status.updateProfile.error && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
          <AlertTriangle size={14} className="flex-shrink-0" />
          {status.updateProfile.error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          <X size={13} /> Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={isSubmitting || status.updateProfile.loading} disabled={!isDirty}>
          <Save size={13} /> Save changes
        </Button>
      </div>
    </form>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono }: {
  icon: React.ElementType; label: string; value?: string | null; mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--color-border)] last:border-0">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        <Icon size={14} className="text-[var(--color-text-muted)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className={cn("mt-0.5 text-sm text-[var(--color-text-primary)] truncate", mono && "font-mono text-xs")}>
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
  const [editing, setEditing] = useState(false);

  useEffect(() => { fetchMe(); }, []);

  if (status.fetchMe.loading && !user) {
    return <div className="flex h-48 items-center justify-center"><Spinner size={24} /></div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-5 animate-slide-up">

      {/* ── Avatar + name card ──────────────────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <AvatarWidget />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-bold tracking-tight truncate">{user.fullName}</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)] truncate">{user.email}</p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {user.isVerified ? (
                <span className="badge border text-xs text-green-400 bg-green-400/10 border-green-400/20">Verified</span>
              ) : (
                <span className="badge border text-xs text-amber-400 bg-amber-400/10 border-amber-400/20">Unverified</span>
              )}
              {activeOrg && userMembership && <RoleBadge role={userMembership.role} />}
            </div>
          </div>
          {!editing && (
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} title="Edit profile">
              <Edit2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Edit form ──────────────────────────────────────────────────────── */}
      {editing && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
            <Edit2 size={14} className="text-[var(--color-accent)]" />
            <p className="font-display text-sm font-bold">Edit Profile</p>
          </div>
          <EditProfileForm onCancel={() => setEditing(false)} />
        </div>
      )}

      {/* ── Personal info ──────────────────────────────────────────────────── */}
      {!editing && (
        <div className="card px-6 py-2">
          <p className="section-label py-4 border-b border-[var(--color-border)]">Personal Information</p>
          <InfoRow icon={User}   label="Full name" value={user.fullName} />
          <InfoRow icon={Mail}   label="Email"     value={user.email}    />
          <InfoRow icon={Phone}  label="Phone"     value={user.phone}    />
          <InfoRow icon={Shield} label="User ID"   value={user.id}       mono />
        </div>
      )}

      {/* ── Organization memberships ───────────────────────────────────────── */}
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
              {activeOrg?._id === org._id && userMembership && <RoleBadge role={userMembership.role} />}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
