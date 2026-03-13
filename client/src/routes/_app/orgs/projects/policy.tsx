// ==================== src/routes/_app/orgs/projects/policy.tsx ====================
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  Shield, Plus, Save, Trash2,
  KeyRound, AlertTriangle, Check,
} from "lucide-react";
import { toast } from "sonner";

import { usePolicyStore }  from "@/store/policy.store";
import { AuthType, AuthMethod, Role, Status } from "@/types";
import { formatDateTime, cn } from "@/lib/utils";
import { Button }    from "@/components/ui/button";
import { ToggleRow } from "@/components/ui/toggle";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/shared/index";

// ─── Multi-check pill group ────────────────────────────────────────────────
function PillGroup<T extends string>({
  label, description, options, selected, onChange, renderLabel,
}: {
  label:        string;
  description?: string;
  options:      T[];
  selected:     T[];
  onChange:     (v: T[]) => void;
  renderLabel?: (v: T) => string;
}) {
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className="py-4 border-b border-[var(--color-border)] last:border-0 space-y-3">
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                "flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5",
                "text-xs font-medium border transition-all duration-150",
                active
                  ? "bg-[var(--color-accent-dim)] border-[var(--color-accent)]/30 text-[var(--color-text-primary)]"
                  : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-2)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              {active && <Check size={10} className="text-[var(--color-accent)]" />}
              {renderLabel ? renderLabel(opt) : opt}
            </button>
          );
        })}
        {options.length === 0 && (
          <span className="text-xs text-[var(--color-text-muted)] italic">No options available</span>
        )}
      </div>
    </div>
  );
}

// ─── Policy form (shared for create and edit) ─────────────────────────────
function PolicyForm({
  initial,
  onSave,
  onDelete,
  saving,
  deleting,
  error,
  isNew,
  hasPasswordPolicy,
}: {
  initial: {
    authRequired:  boolean;
    phoneRequired: boolean;
    authType:      AuthType;
    authMethods:   AuthMethod[];
    roles:         string[];
    statuses:      string[];
  };
  onSave:     (v: typeof initial) => void;
  onDelete?:  () => void;
  saving:     boolean;
  deleting?:  boolean;
  error?:     string | null;
  isNew:      boolean;
  hasPasswordPolicy: boolean;
}) {
  const [vals, setVals] = useState(initial);
  const [dirty, setDirty] = useState(false);

  const set = <K extends keyof typeof vals>(key: K, value: typeof vals[K]) => {
    setVals((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const { projectId } = useParams<{ projectId: string }>();

  if (!hasPasswordPolicy) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle size={22} className="text-amber-400" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-base font-bold">Password Policy Required</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            You must create a Password Policy before configuring the Project Policy.
          </p>
        </div>
        <Link to={`../password-policy`} relative="path">
          <Button size="sm" variant="secondary">
            <KeyRound size={13} />
            Create Password Policy First
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0">

      {/* Auth required */}
      <ToggleRow
        label="Authentication required"
        description="End users must authenticate to access this project"
        badge="Core"
        checked={vals.authRequired}
        onChange={(v) => set("authRequired", v)}
      />

      {/* Phone required */}
      <ToggleRow
        label="Phone number required"
        description="End users must provide a phone number during signup"
        checked={vals.phoneRequired}
        onChange={(v) => set("phoneRequired", v)}
      />

      {/* Auth type */}
      <div className="py-4 border-b border-[var(--color-border)] space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">Authentication type</p>
        <p className="text-xs text-[var(--color-text-muted)]">Primary authentication mechanism</p>
        <Select value={vals.authType} onValueChange={(v) => set("authType", v as AuthType)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AuthType).map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Auth methods */}
      <PillGroup
        label="Allowed auth methods"
        description="Which methods end users can use to authenticate"
        options={Object.values(AuthMethod)}
        selected={vals.authMethods}
        onChange={(v) => set("authMethods", v)}
        renderLabel={(m) => m.charAt(0).toUpperCase() + m.slice(1)}
      />

      {/* Allowed roles */}
      <PillGroup
        label="Allowed roles"
        description="Which end-user roles are permitted in this project"
        options={Object.values(Role)}
        selected={vals.roles as Role[]}
        onChange={(v) => set("roles", v)}
        renderLabel={(r) => r.charAt(0).toUpperCase() + r.slice(1)}
      />

      {/* Allowed statuses */}
      <PillGroup
        label="Allowed statuses"
        description="Which end-user statuses can access this project"
        options={Object.values(Status)}
        selected={vals.statuses as Status[]}
        onChange={(v) => set("statuses", v)}
        renderLabel={(s) => s.charAt(0).toUpperCase() + s.slice(1)}
      />

      {error && <p className="pt-4 text-xs text-red-400">{error}</p>}

      <div className="flex gap-3 pt-5">
        {onDelete && (
          <Button variant="destructive" size="sm" onClick={onDelete} loading={deleting}>
            <Trash2 size={13} />
            Delete
          </Button>
        )}
        <Button
          className="flex-1"
          disabled={!dirty && !isNew}
          onClick={() => onSave(vals)}
          loading={saving}
        >
          {isNew ? <Plus size={13} /> : <Save size={13} />}
          {isNew ? "Create Project Policy" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function ProjectPolicyPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const {
    projectPolicy, passwordPolicy,
    fetchProjectPolicy, fetchPasswordPolicy,
    createProjectPolicy, updateProjectPolicy, deleteProjectPolicy,
    status,
  } = usePolicyStore();

  useEffect(() => {
    if (!projectId) return;
    fetchProjectPolicy(projectId);
    fetchPasswordPolicy(projectId);
  }, [projectId]);

  const loading = status.fetchProjectPolicy.loading || status.fetchPasswordPolicy.loading;

  const defaults = {
    authRequired:  projectPolicy?.authRequired  ?? true,
    phoneRequired: projectPolicy?.phoneRequired ?? false,
    authType:      projectPolicy?.authType      ?? AuthType.PASSWORD,
    authMethods:   projectPolicy?.authMethods   ?? [],
    roles:         projectPolicy?.roles         ?? [],
    statuses:      projectPolicy?.statuses      ?? [],
  };

  const handleSave = async (vals: typeof defaults) => {
    if (!projectId) return;
    const ok = projectPolicy
      ? await updateProjectPolicy(projectId, vals)
      : await createProjectPolicy(projectId, vals);
    if (ok) toast.success(projectPolicy ? "Policy updated" : "Policy created");
    else    toast.error((projectPolicy ? status.updateProjectPolicy.error : status.createProjectPolicy.error) ?? "Failed");
  };

  const handleDelete = async () => {
    if (!projectId || !confirm("Delete project policy?")) return;
    const ok = await deleteProjectPolicy(projectId);
    if (ok) toast.success("Policy deleted");
    else    toast.error(status.deleteProjectPolicy.error ?? "Failed");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 animate-slide-up">

      {/* ── Left: form ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-5">

        {/* Header */}
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
              <Shield size={16} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Project Policy</h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                {projectPolicy ? "Manage access and auth configuration" : "Set up authentication and access rules"}
              </p>
            </div>
            {projectPolicy && (
              <span className="ml-auto badge border text-xs text-green-400 bg-green-400/10 border-green-400/20">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="card px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <PolicyForm
              key={projectPolicy?._id ?? "new"}
              initial={defaults}
              onSave={handleSave}
              onDelete={projectPolicy ? handleDelete : undefined}
              saving={status.createProjectPolicy.loading || status.updateProjectPolicy.loading}
              deleting={status.deleteProjectPolicy.loading}
              error={status.createProjectPolicy.error || status.updateProjectPolicy.error}
              isNew={!projectPolicy}
              hasPasswordPolicy={!!passwordPolicy}
            />
          )}
        </div>

        {/* Meta */}
        {projectPolicy && (
          <div className="card px-5 py-4">
            <p className="section-label mb-3">Metadata</p>
            <dl className="space-y-3">
              {[
                { label: "Policy ID",     value: projectPolicy._id,                       mono: true  },
                { label: "Pwd Policy ID", value: typeof projectPolicy.passwordPolicyId === "string" ? projectPolicy.passwordPolicyId : projectPolicy.passwordPolicyId._id, mono: true },
                { label: "Created",       value: formatDateTime(projectPolicy.createdAt),  mono: false },
                { label: "Updated",       value: formatDateTime(projectPolicy.updatedAt),  mono: false },
              ].map(({ label, value, mono }) => (
                <div key={label} className="flex items-center gap-4">
                  <dt className="w-28 flex-shrink-0 text-xs text-[var(--color-text-muted)]">{label}</dt>
                  <dd className={cn(
                    "text-xs text-[var(--color-text-secondary)] truncate",
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

      {/* ── Right: info ─────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

        {/* Password policy status */}
        <div className={cn(
          "card p-5 space-y-3",
          passwordPolicy
            ? "border-green-500/20 bg-green-500/5"
            : "border-amber-500/20 bg-amber-500/5"
        )}>
          <div className="flex items-center gap-2">
            <KeyRound size={14} className={passwordPolicy ? "text-green-400" : "text-amber-400"} />
            <p className="text-sm font-semibold">
              Password Policy
            </p>
            <span className={cn(
              "ml-auto badge border text-xs",
              passwordPolicy
                ? "text-green-400 bg-green-400/10 border-green-400/20"
                : "text-amber-400 bg-amber-400/10 border-amber-400/20"
            )}>
              {passwordPolicy ? "Linked" : "Missing"}
            </span>
          </div>
          {passwordPolicy ? (
            <p className="text-xs text-[var(--color-text-secondary)]">
              Min length: <strong>{passwordPolicy.minLength}</strong> chars ·{" "}
              {[
                passwordPolicy.requireNumbers      && "Numbers",
                passwordPolicy.requireUppercase    && "Uppercase",
                passwordPolicy.requireSpecialChars && "Specials",
              ].filter(Boolean).join(" · ") || "No extra requirements"}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">
              Create a Password Policy first — it will be automatically linked.
            </p>
          )}
          {!passwordPolicy && (
            <Link to={`../password-policy`} relative="path">
              <Button size="sm" variant="secondary" className="w-full mt-1">
                <KeyRound size={12} />
                Go to Password Policy
              </Button>
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            What is this?
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Project Policy controls how end users authenticate and which roles and statuses are permitted to access your project.
          </p>
          <div className="space-y-2 pt-1">
            {[
              "One policy per project",
              "Requires a Password Policy to exist first",
              "Controls auth methods, roles, and statuses",
              "Delete Project Policy before Password Policy",
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
