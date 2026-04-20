// ==================== src/routes/_auth/login.tsx ====================
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAuthStore } from "@/store";
import { useMockStore } from "@/store/mock.store";
import { loginSchema, type LoginFormValues } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  const { login, status, isAuthenticated, clearError } = useAuthStore();
  const { isMockMode } = useMockStore();
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearError("login");
    const wasMock = isMockMode;
    const ok = await login(values);
    if (ok) {
      if (!wasMock && useMockStore.getState().isMockMode) {
        toast.warning("Server unreachable — running in demo mode with mock data.", { duration: 6000 });
      } else {
        toast.success("Welcome back!");
      }
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error banner */}
      {status.login.error && (
        <div className="flex items-center gap-3 rounded-[var(--radius)] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-slide-up">
          <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
          {status.login.error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="section-label">Email address</label>
          <div className="relative">
            <Mail
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            />
            <Input
              {...register("email")}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              autoFocus
              error={errors.email?.message}
              className="pl-9"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="section-label">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            />
            <Input
              {...register("password")}
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              className="pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors p-1"
              tabIndex={-1}
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting || status.login.loading}
        >
          Sign in
        </Button>

      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">or</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      {/* OAuth placeholders */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Google", icon: "G" },
          { name: "GitHub", icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          )},
        ].map(({ name, icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => toast.info(`${name} OAuth coming soon`)}
            className={cn(
              "flex h-11 items-center justify-center gap-2.5 rounded-[var(--radius)]",
              "border border-[var(--color-border)] bg-[var(--color-surface-2)]",
              "text-sm font-medium text-[var(--color-text-secondary)]",
              "hover:border-[var(--color-border-2)] hover:text-[var(--color-text-primary)]",
              "active:scale-[0.98] transition-all duration-150"
            )}
          >
            <span className="flex h-4 w-4 items-center justify-center font-bold text-xs">
              {icon}
            </span>
            {name}
          </button>
        ))}
      </div>

      {/* Sign up link */}
      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
        >
          Create one
        </Link>
      </p>

    </div>
  );
}
