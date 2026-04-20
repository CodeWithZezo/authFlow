// ==================== src/routes/_auth/signup.tsx ====================
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, X } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store";
import { useMockStore } from "@/store/mock.store";
import { signupSchema, type SignupFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ─── Password strength rules ────────────────────────────────────────────────
const PWD_RULES = [
  { label: "At least 8 characters",  test: (p: string) => p.length >= 8         },
  { label: "One uppercase letter",   test: (p: string) => /[A-Z]/.test(p)       },
  { label: "One number",             test: (p: string) => /[0-9]/.test(p)       },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PWD_RULES.filter((r) => r.test(password)).length;
  const pct    = (passed / PWD_RULES.length) * 100;
  const color  = passed === 3 ? "#22c55e" : passed >= 2 ? "#f59e0b" : "#ef4444";

  return (
    <div className="mt-2 space-y-2 animate-slide-up">
      {/* Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {/* Rules */}
      <div className="grid grid-cols-1 gap-1">
        {PWD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-2">
              <div className={cn(
                "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                ok
                  ? "bg-green-500/20 text-green-400"
                  : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
              )}>
                {ok ? <Check size={9} /> : <X size={9} />}
              </div>
              <span className={cn(
                "text-xs transition-colors duration-200",
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

// ─── Page ───────────────────────────────────────────────────────────────────
export function SignupPage() {
  const navigate = useNavigate();
  const { signup, status, isAuthenticated, clearError } = useAuthStore();
  const { isMockMode } = useMockStore();
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", phone: "" },
    mode: "onChange",
  });

  // Watch password for strength indicator
  const password = useWatch({ control, name: "password" });

  const onSubmit = async (values: SignupFormValues) => {
    clearError("signup");
    const { confirmPassword: _c, ...payload } = values;
    const wasMock = isMockMode;
    const ok = await signup({ ...payload, phone: payload.phone || undefined });
    if (ok) {
      if (!wasMock && useMockStore.getState().isMockMode) {
        toast.warning("Server unreachable — running in demo mode with mock data.", { duration: 6000 });
      } else {
        toast.success("Account created! Welcome aboard.");
      }
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-3xl font-bold tracking-tight">Create account</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Get started — it's free
        </p>
      </div>

      {/* Error banner */}
      {status.signup.error && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
          {status.signup.error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Full name */}
        <div className="space-y-1.5">
          <label className="section-label">Full name</label>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              {...register("fullName")}
              placeholder="John Doe"
              autoComplete="name"
              autoFocus
              error={errors.fullName?.message}
              className="pl-9"
            />
          </div>
          {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="section-label">Email address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              {...register("email")}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              error={errors.email?.message}
              className="pl-9"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Phone (optional) */}
        <div className="space-y-1.5">
          <label className="section-label">
            Phone
            <span className="ml-1 font-normal normal-case text-[var(--color-text-muted)]">(optional)</span>
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              {...register("phone")}
              type="tel"
              placeholder="+1 234 567 8900"
              autoComplete="tel"
              error={errors.phone?.message}
              className="pl-9"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="section-label">Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              {...register("password")}
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          <PasswordStrength password={password ?? ""} />
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <label className="section-label">Confirm password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            <Input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms notice */}
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
          By creating an account you agree to our{" "}
          <span className="text-[var(--color-accent)] cursor-pointer hover:underline">Terms of Service</span>{" "}
          and{" "}
          <span className="text-[var(--color-accent)] cursor-pointer hover:underline">Privacy Policy</span>.
        </p>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting || status.signup.loading}
        >
          Create account
        </Button>

      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          Sign in
        </Link>
      </p>

    </div>
  );
}
