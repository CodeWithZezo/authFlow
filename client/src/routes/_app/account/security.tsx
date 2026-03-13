// ==================== src/routes/_app/account/security.tsx ====================
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock, Eye, EyeOff, Check, X,
  ShieldCheck, AlertTriangle, KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth.store";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { cn }     from "@/lib/utils";

// ─── Password strength rules ───────────────────────────────────────────────
const PWD_RULES = [
  { label: "At least 8 characters",  test: (p: string) => p.length >= 8   },
  { label: "One uppercase letter",   test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number",             test: (p: string) => /[0-9]/.test(p) },
];

function StrengthIndicator({ password }: { password: string }) {
  if (!password) return null;
  const passed = PWD_RULES.filter((r) => r.test(password)).length;
  const color  = passed === 3 ? "#22c55e" : passed >= 2 ? "#f59e0b" : "#ef4444";
  const label  = passed === 3 ? "Strong"  : passed >= 2 ? "Fair"   : "Weak";

  return (
    <div className="mt-2 space-y-2 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(passed / 3) * 100}%`, background: color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {PWD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              <div className={cn(
                "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-colors",
                ok ? "bg-green-500/20 text-green-400" : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
              )}>
                {ok ? <Check size={9} /> : <X size={9} />}
              </div>
              <span className={cn(
                "text-xs transition-colors",
                ok ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"
              )}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Change password form ──────────────────────────────────────────────────
function ChangePasswordForm() {
  const { changePassword, status, clearError } = useAuthStore();
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [success,      setSuccess]      = useState(false);

  const {
    register, handleSubmit, control, reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
    mode: "onChange",
  });

  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    clearError("changePassword");
    setSuccess(false);
    const ok = await changePassword(values.currentPassword, values.newPassword);
    if (ok) {
      toast.success("Password changed successfully");
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

      {/* Current password */}
      <div className="space-y-1.5">
        <label className="section-label">Current password</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input
            {...register("currentPassword")}
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-xs text-red-400">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <label className="section-label">New password</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input
            {...register("newPassword")}
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors.newPassword
          ? <p className="text-xs text-red-400">{errors.newPassword.message}</p>
          : <StrengthIndicator password={newPassword ?? ""} />
        }
      </div>

      {/* Confirm new password */}
      <div className="space-y-1.5">
        <label className="section-label">Confirm new password</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <Input
            {...register("confirmNewPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmNewPassword?.message}
            className="pl-9 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors.confirmNewPassword && (
          <p className="text-xs text-red-400">{errors.confirmNewPassword.message}</p>
        )}
      </div>

      {/* Server error */}
      {status.changePassword.error && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
          <AlertTriangle size={14} className="flex-shrink-0" />
          {status.changePassword.error}
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400 animate-slide-up">
          <ShieldCheck size={14} className="flex-shrink-0" />
          Password changed successfully!
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={isSubmitting || status.changePassword.loading}
      >
        <KeyRound size={14} />
        Update password
      </Button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SecurityPage() {
  return (
    <div className="max-w-xl space-y-5 animate-slide-up">

      {/* Change password card */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-1 border-b border-[var(--color-border)]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
            <KeyRound size={16} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-display text-base font-bold">Change Password</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Update your login password
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </div>

      {/* Security tips */}
      <div className="card p-5 space-y-4">
        <p className="section-label">Security Tips</p>
        <div className="space-y-3">
          {[
            {
              icon: ShieldCheck,
              title:  "Use a strong password",
              desc:   "At least 8 characters with uppercase, numbers, and symbols.",
              color:  "text-green-400",
              bg:     "bg-green-400/10",
            },
            {
              icon: AlertTriangle,
              title:  "Never reuse passwords",
              desc:   "Use a unique password for each service you use.",
              color:  "text-amber-400",
              bg:     "bg-amber-400/10",
            },
            {
              icon: Lock,
              title:  "Review active sessions",
              desc:   "Check the Sessions tab regularly for unknown devices.",
              color:  "text-blue-400",
              bg:     "bg-blue-400/10",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex items-start gap-3">
              <div className={cn(
                "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg mt-0.5",
                bg
              )}>
                <Icon size={13} className={color} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{title}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
