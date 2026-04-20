// ==================== src/routes/_app/orgs/projects/password-policy.tsx ====================
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyRound, Plus, Save, Trash2, Shield,
  Hash, Type, Star,
} from "lucide-react";
import { toast } from "sonner";

import { usePolicyStore } from "@/store/policy.store";
import type { PasswordPolicy } from "@/types";
import {
  createPasswordPolicySchema,
  type CreatePasswordPolicyFormValues,
} from "@/lib/validators";
import { formatDateTime } from "@/lib/utils";
import { Button }     from "@/components/ui/button";
import { ToggleRow }  from "@/components/ui/toggle";
import { Spinner }    from "@/components/shared/index";
import { cn }         from "@/lib/utils";

// ─── Slider for minLength ────────────────────────────────────────────────────
function LengthSlider({
  value, onChange, disabled,
}: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="space-y-3 py-4 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Minimum length</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Minimum number of characters required
          </p>
        </div>
        <div className="flex h-9 w-12 items-center justify-center rounded-[var(--radius)] bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
          <span className="font-display text-base font-bold text-[var(--color-accent)]">{value}</span>
        </div>
      </div>

      <input
        type="range"
        min={4}
        max={32}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          "w-full h-1.5 rounded-full appearance-none cursor-pointer",
          "bg-[var(--color-border)]",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
          "[&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:bg-[var(--color-accent)]",
          "[&::-webkit-slider-thumb]:shadow-[0_0_0_3px_var(--color-accent-dim)]",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        style={{
          background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((value - 4) / 28) * 100}%, var(--color-border) ${((value - 4) / 28) * 100}%, var(--color-border) 100%)`,
        }}
      />

      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>4</span>
        <span>32</span>
      </div>
    </div>
  );
}

// ─── Create form ─────────────────────────────────────────────────────────────
function CreatePasswordPolicyForm() {
  const { projectId }  = useParams<{ projectId: string }>();
  const { createPasswordPolicy, status } = usePolicyStore();

  const { handleSubmit, watch, setValue, formState: { isSubmitting } } =
    useForm<CreatePasswordPolicyFormValues>({
      resolver: zodResolver(createPasswordPolicySchema),
      defaultValues: {
        minLength:           6,
        requireNumbers:      true,
        requireUppercase:    true,
        requireSpecialChars: false,
      },
    });

  const values = watch();

  const onSubmit = async (data: CreatePasswordPolicyFormValues) => {
    if (!projectId) return;
    const ok = await createPasswordPolicy(projectId, data);
    if (ok) toast.success("Password policy created");
    else    toast.error(status.createPasswordPolicy.error ?? "Failed to create policy");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      <LengthSlider
        value={values.minLength ?? 6}
        onChange={(v) => setValue("minLength", v)}
      />

      <ToggleRow
        label="Require numbers"
        description="Password must contain at least one digit (0-9)"
        badge="0-9"
        checked={values.requireNumbers ?? true}
        onChange={(v) => setValue("requireNumbers", v)}
      />
      <ToggleRow
        label="Require uppercase"
        description="Password must contain at least one uppercase letter"
        badge="A-Z"
        checked={values.requireUppercase ?? true}
        onChange={(v) => setValue("requireUppercase", v)}
      />
      <ToggleRow
        label="Require special characters"
        description="Password must contain at least one special character (!@#$...)"
        badge="!@#"
        checked={values.requireSpecialChars ?? false}
        onChange={(v) => setValue("requireSpecialChars", v)}
      />

      {status.createPasswordPolicy.error && (
        <p className="pt-4 text-xs text-red-400">{status.createPasswordPolicy.error}</p>
      )}

      <div className="pt-5">
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting || status.createPasswordPolicy.loading}
        >
          <Plus size={14} />
          Create Password Policy
        </Button>
      </div>
    </form>
  );
}

// ─── Edit form ────────────────────────────────────────────────────────────────
function EditPasswordPolicyForm() {
  const { projectId }    = useParams<{ projectId: string }>();
  const { passwordPolicy, updatePasswordPolicy, deletePasswordPolicy, status } = usePolicyStore();
  const [dirty, setDirty] = useState(false);
  const [vals, setVals]   = useState({
    minLength:           passwordPolicy?.minLength           ?? 6,
    requireNumbers:      passwordPolicy?.requireNumbers      ?? true,
    requireUppercase:    passwordPolicy?.requireUppercase    ?? true,
    requireSpecialChars: passwordPolicy?.requireSpecialChars ?? false,
  });

  // Sync when policy loads
  useEffect(() => {
    if (passwordPolicy) {
      setVals({
        minLength:           passwordPolicy.minLength,
        requireNumbers:      passwordPolicy.requireNumbers,
        requireUppercase:    passwordPolicy.requireUppercase,
        requireSpecialChars: passwordPolicy.requireSpecialChars,
      });
      setDirty(false);
    }
  }, [passwordPolicy?._id]);

  const update = (key: keyof typeof vals, value: typeof vals[keyof typeof vals]) => {
    setVals((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    const ok = await updatePasswordPolicy(projectId, vals);
    if (ok) { toast.success("Password policy updated"); setDirty(false); }
    else    toast.error(status.updatePasswordPolicy.error ?? "Failed");
  };

  const handleDelete = async () => {
    if (!projectId || !confirm("Delete the password policy? Note: the Project Policy must be deleted first if it references this.")) return;
    const ok = await deletePasswordPolicy(projectId);
    if (ok) toast.success("Password policy deleted");
    else    toast.error(status.deletePasswordPolicy.error ?? "Failed — ensure Project Policy is deleted first");
  };

  return (
    <div className="space-y-0">
      <LengthSlider
        value={vals.minLength}
        onChange={(v) => update("minLength", v)}
      />
      <ToggleRow
        label="Require numbers"
        description="Password must contain at least one digit (0-9)"
        badge="0-9"
        checked={vals.requireNumbers}
        onChange={(v) => update("requireNumbers", v)}
      />
      <ToggleRow
        label="Require uppercase"
        description="Password must contain at least one uppercase letter"
        badge="A-Z"
        checked={vals.requireUppercase}
        onChange={(v) => update("requireUppercase", v)}
      />
      <ToggleRow
        label="Require special characters"
        description="Password must contain at least one special character"
        badge="!@#"
        checked={vals.requireSpecialChars}
        onChange={(v) => update("requireSpecialChars", v)}
      />

      <div className="flex gap-3 pt-5">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          loading={status.deletePasswordPolicy.loading}
        >
          <Trash2 size={13} />
          Delete
        </Button>
        <Button
          className="flex-1"
          disabled={!dirty}
          onClick={handleSave}
          loading={status.updatePasswordPolicy.loading}
        >
          <Save size={13} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Strength preview ─────────────────────────────────────────────────────────
function StrengthPreview({ policy }: { policy: PasswordPolicy }) {
  const rules = [
    { icon: Hash,   label: `Min ${policy.minLength} characters`,      active: true },
    { icon: Hash,   label: "Requires numbers",       active: policy.requireNumbers      },
    { icon: Type,   label: "Requires uppercase",     active: policy.requireUppercase    },
    { icon: Star,   label: "Requires special chars", active: policy.requireSpecialChars },
  ];

  const score = rules.filter((r) => r.active).length;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">
          Strength Preview
        </p>
        <span className={cn(
          "badge border text-xs",
          score >= 3 ? "text-green-400 bg-green-400/10 border-green-400/20"
            : score >= 2 ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
            : "text-red-400 bg-red-400/10 border-red-400/20"
        )}>
          {score >= 3 ? "Strong" : score >= 2 ? "Moderate" : "Weak"}
        </span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i <= score
                ? score >= 3 ? "bg-green-400" : score >= 2 ? "bg-amber-400" : "bg-red-400"
                : "bg-[var(--color-border)]"
            )}
          />
        ))}
      </div>

      <div className="space-y-2">
        {rules.map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              active ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]" : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
            )}>
              <Icon size={11} />
            </div>
            <span className={cn(
              "text-xs",
              active ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)] line-through opacity-50"
            )}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PasswordPolicyPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { passwordPolicy, status, fetchPasswordPolicy } = usePolicyStore();

  useEffect(() => {
    if (projectId) fetchPasswordPolicy(projectId);
  }, [projectId]);

  const loading = status.fetchPasswordPolicy.loading;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 animate-slide-up">

      {/* ── Left: form ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Header card */}
        <div className="card p-6 space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
              <KeyRound size={16} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Password Policy</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {passwordPolicy ? "Manage password requirements" : "Create password requirements for end users"}
              </p>
            </div>
          </div>

          {/* Creation order hint */}
          {!passwordPolicy && (
            <div className="flex items-start gap-3 rounded-[var(--radius)] border border-[var(--color-accent)]/20 bg-[var(--color-accent-dim)] p-3 mt-4">
              <Shield size={14} className="mt-0.5 flex-shrink-0 text-[var(--color-accent)]" />
              <div className="text-xs text-[var(--color-text-secondary)]">
                <p className="font-semibold">Create this first</p>
                <p className="mt-0.5">Password Policy must be created before Project Policy.</p>
              </div>
            </div>
          )}
        </div>

        {/* Form card */}
        <div className="card px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : passwordPolicy ? (
            <EditPasswordPolicyForm />
          ) : (
            <CreatePasswordPolicyForm />
          )}
        </div>

        {/* Meta */}
        {passwordPolicy && (
          <div className="card px-5 py-4">
            <p className="section-label mb-3">Metadata</p>
            <dl className="space-y-3">
              {[
                { label: "Policy ID",  value: passwordPolicy._id,                      mono: true  },
                { label: "Created",    value: formatDateTime(passwordPolicy.createdAt), mono: false },
                { label: "Updated",    value: formatDateTime(passwordPolicy.updatedAt), mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center gap-4">
                  <dt className="w-24 flex-shrink-0 text-xs text-[var(--color-text-muted)]">{label}</dt>
                  <dd className={cn(
                    "text-xs text-[var(--color-text-secondary)]",
                    mono && "font-mono bg-[var(--color-surface-2)] border border-[var(--color-border)] px-2 py-0.5 rounded-[var(--radius-sm)] select-all"
                  )}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* ── Right: strength preview ─────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">
        {passwordPolicy && <StrengthPreview policy={passwordPolicy} />}

        {/* What is this? */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            What is this?
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Password Policy defines the strength requirements enforced when end users set or update their passwords in this project.
          </p>
          <div className="space-y-2 pt-1">
            {[
              "Enforced during end user signup",
              "Enforced during password reset",
              "Must be created before Project Policy",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                <p className="text-xs text-[var(--color-text-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
