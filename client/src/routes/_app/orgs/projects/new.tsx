// ==================== src/routes/_app/orgs/projects/new.tsx ====================
import { useNavigate, useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { toast } from "sonner";

import { useProjectStore } from "@/store/project.store";
import { createProjectSchema, type CreateProjectFormValues } from "@/lib/validators";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { cn }       from "@/lib/utils";

export function CreateProjectPage() {
  const { orgId }  = useParams<{ orgId: string }>();
  const navigate   = useNavigate();
  const { createProject, status } = useProjectStore();

  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (values: CreateProjectFormValues) => {
    if (!orgId) return;
    const project = await createProject(orgId, values);
    if (!project) { toast.error(status.createProject.error ?? "Failed to create project"); return; }
    toast.success("Project created!");
    navigate(`/orgs/${orgId}/projects/${project._id}/overview`);
  };

  return (
    <div className="mx-auto max-w-lg animate-slide-up">
      <Link
        to={`/orgs/${orgId}/projects`}
        className="mb-8 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to projects
      </Link>

      <div className="card p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
            <FolderKanban size={22} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">New Project</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Create a project workspace</p>
          </div>
        </div>

        {status.createProject.error && (
          <div className="mb-5 flex items-center gap-3 rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
            {status.createProject.error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <label className="section-label">
              Project name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <Input {...register("name")} placeholder="My Awesome Project" autoFocus error={errors.name?.message} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="section-label">
              Description
              <span className="ml-1 font-normal normal-case text-[var(--color-text-muted)]">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="What is this project for?"
              rows={3}
              className={cn(
                "input-base resize-none leading-relaxed",
                "focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-dim)]"
              )}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div className={cn(
            "rounded-[var(--radius)] border border-[var(--color-border)]",
            "bg-[var(--color-surface-2)] p-4 space-y-2"
          )}>
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">What happens next</p>
            {[
              "You'll be assigned as Manager of this project",
              "Configure auth and password policies",
              "Add team members with specific roles",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                <p className="text-xs text-[var(--color-text-muted)]">{item}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(`/orgs/${orgId}/projects`)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={isSubmitting || status.createProject.loading}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
