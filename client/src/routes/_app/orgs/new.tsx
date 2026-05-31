// ==================== src/routes/_app/orgs/new.tsx ====================
import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useOrgStore }  from "@/store/org.store";
import { createOrgSchema, type CreateOrgFormValues } from "@/lib/validators";
import { toSlug, cn } from "@/lib/utils";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { InlineError, FormError } from "@/components/shared/index";

export function CreateOrgPage() {
  const navigate = useNavigate();
  const { createOrg, status } = useOrgStore();

  const {
    register, handleSubmit, control, setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "" },
    mode: "onChange",
  });

  // Auto-generate slug from name
  const name = useWatch({ control, name: "name" });
  useEffect(() => {
    if (name) setValue("slug", toSlug(name), { shouldValidate: true });
  }, [name]);

  const onSubmit = async (values: CreateOrgFormValues) => {
    const org = await createOrg(values);
    if (!org) {
      toast.error(status.createOrg.error ?? "Failed to create organization");
      return;
    }
    toast.success("Organization created!");
    navigate(`/orgs/${org._id}/overview`);
  };

  return (
    <div className="mx-auto max-w-lg animate-slide-up">

      {/* Back */}
      <Link
        to="/dashboard"
        className="mb-8 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      {/* Card */}
      <div className="card p-8">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
            <Building2 size={22} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              New Organization
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Create a workspace for your team
            </p>
          </div>
        </div>

        {/* Error */}
        <InlineError message={status.createOrg.error} className="mb-5" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="section-label">
              Organization name <span className="text-[var(--color-accent)]">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="Acme Corp"
              autoFocus
              error={errors.name?.message}
            />
            <FormError message={errors.name?.message} />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="section-label">
                Slug <span className="text-[var(--color-accent)]">*</span>
              </label>
              <span onClick={() => toast.info(`Auto generate coming soon`)} className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Sparkles size={11} />
                Auto-generated
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] select-none">
                /
              </span>
              <Input
                {...register("slug")}
                placeholder="acme-corp"
                error={errors.slug?.message}
                className="pl-6 font-mono text-sm"
              />
            </div>
            {errors.slug
              ? <FormError message={errors.slug.message} />
              : <p className="text-xs text-[var(--color-text-muted)]">
                  Lowercase letters, numbers, and hyphens only. Cannot be changed later.
                </p>
            }
          </div>

          {/* Info box */}
          <div className={cn(
            "rounded-[var(--radius)] border border-[var(--color-border)]",
            "bg-[var(--color-surface-2)] p-4 space-y-2"
          )}>
            <p className="text-xs font-medium text-[var(--color-text-secondary)]">
              What happens next
            </p>
            {[
              "You'll be assigned as Owner of this organization",
              "Invite teammates and assign roles",
              "Create projects and manage access policies",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                <p className="text-xs text-[var(--color-text-muted)]">{item}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={isSubmitting || status.createOrg.loading}
            >
              Create Organization
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
