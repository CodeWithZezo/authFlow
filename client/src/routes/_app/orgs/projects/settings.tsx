// ==================== src/routes/_app/orgs/projects/settings.tsx ====================
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { useProjectStore } from "@/store/project.store";
import { updateProjectSchema, type UpdateProjectFormValues } from "@/lib/validators";
import { Status } from "@/types";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function ProjectSettingsPage() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const { activeProject, updateProject, deleteProject, status } = useProjectStore();

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name:        activeProject?.name        ?? "",
      description: activeProject?.description ?? "",
      status:      activeProject?.status      ?? Status.ACTIVE,
    },
  });

  useEffect(() => {
    if (activeProject) reset({
      name:        activeProject.name,
      description: activeProject.description ?? "",
      status:      activeProject.status,
    });
  }, [activeProject?._id]);

  const currentStatus = watch("status");

  const onSubmit = async (values: UpdateProjectFormValues) => {
    if (!orgId || !projectId) return;
    const ok = await updateProject(orgId, projectId, values);
    if (ok) { toast.success("Settings saved"); reset(values); }
    else     toast.error(status.updateProject.error ?? "Failed to save");
  };

  return (
    <div className="max-w-lg space-y-8 animate-slide-up">

      {/* General settings */}
      <div className="card p-6 space-y-5">
        <div>
          <p className="font-display text-base font-bold">General Settings</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Update project info and status.</p>
        </div>

        {status.updateProject.error && (
          <div className="rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {status.updateProject.error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="section-label">Project Name</label>
            <Input {...register("name")} placeholder="My Project" error={errors.name?.message} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Description</label>
            <textarea
              {...register("description")}
              placeholder="What is this project for?"
              rows={3}
              className={cn(
                "input-base resize-none leading-relaxed",
                "focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
              )}
            />
          </div>

          <div className="space-y-1.5">
            <label className="section-label">Status</label>
            <Select value={currentStatus} onValueChange={(v) => setValue("status", v as Status, { shouldDirty: true })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Status).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={!isDirty} loading={isSubmitting || status.updateProject.loading}>
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
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Permanent, irreversible actions.</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-[var(--radius)] border border-red-500/15 bg-[var(--color-surface)] p-4">
          <div>
            <p className="text-sm font-medium">Delete project</p>
            <p className="text-xs text-[var(--color-text-muted)]">Removes all members and policies.</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            loading={status.deleteProject.loading}
            onClick={async () => {
              if (!orgId || !projectId || !confirm(`Delete "${activeProject?.name}"? This cannot be undone.`)) return;
              const ok = await deleteProject(orgId, projectId);
              if (ok) { toast.success("Project deleted"); navigate(`/orgs/${orgId}/projects`); }
              else toast.error(status.deleteProject.error ?? "Failed");
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
