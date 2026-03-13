// ==================== src/routes/_app/orgs/settings.tsx ====================
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { useOrgStore }  from "@/store/org.store";
import { updateOrgSchema, type UpdateOrgFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";

export function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate  = useNavigate();
  const { activeOrg, updateOrg, deleteOrg, status } = useOrgStore();

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateOrgFormValues>({
    resolver: zodResolver(updateOrgSchema),
    defaultValues: { name: activeOrg?.name ?? "", slug: activeOrg?.slug ?? "" },
  });

  // Sync form when org loads
  useEffect(() => {
    if (activeOrg) reset({ name: activeOrg.name, slug: activeOrg.slug });
  }, [activeOrg?._id]);

  const onSubmit = async (values: UpdateOrgFormValues) => {
    if (!orgId) return;
    const ok = await updateOrg(orgId, values);
    if (ok) { toast.success("Settings saved"); reset(values); }
    else     toast.error(status.updateOrg.error ?? "Failed to save");
  };

  return (
    <div className="max-w-lg space-y-8 animate-slide-up">

      {/* General settings */}
      <div className="card p-6 space-y-5">
        <div>
          <p className="font-display text-base font-bold">General Settings</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Update your organization's name and slug.
          </p>
        </div>

        {status.updateOrg.error && (
          <div className="rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {status.updateOrg.error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="section-label">Organization Name</label>
            <Input {...register("name")} placeholder="Acme Corp" error={errors.name?.message} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Slug</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">/</span>
              <Input
                {...register("slug")}
                placeholder="acme-corp"
                error={errors.slug?.message}
                className="pl-6 font-mono text-sm"
              />
            </div>
            {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={!isDirty}
              loading={isSubmitting || status.updateOrg.loading}
            >
              <Save size={13} />
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-[var(--radius-lg)] border border-red-500/20 bg-red-500/5 p-6 space-y-4">
        <div>
          <p className="font-display text-sm font-bold text-red-400">Danger Zone</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            These actions are permanent and cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-red-500/15 bg-[var(--color-surface)] p-4">
          <div>
            <p className="text-sm font-medium">Delete organization</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Removes all members and associated data.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            loading={status.deleteOrg.loading}
            onClick={async () => {
              if (!orgId || !confirm(`Delete "${activeOrg?.name}"? This cannot be undone.`)) return;
              const ok = await deleteOrg(orgId);
              if (ok) { toast.success("Organization deleted"); navigate("/dashboard"); }
              else toast.error(status.deleteOrg.error ?? "Failed");
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
