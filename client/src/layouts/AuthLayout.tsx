// ==================== src/layouts/AuthLayout.tsx ====================
import { Outlet } from "react-router";
import { Layers } from "lucide-react";
import { MockBanner } from "@/components/shared/MockBanner";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-bg">

      {/* ── Left: Brand panel ──────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col justify-between overflow-hidden bg-surface border-r border-border p-12">

        {/* Grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px),
                              linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-accent">
            <Layers size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-text-primary">
            AuthFlow
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          {[
            { label: "Multi-tenant organizations", desc: "Invite your team and manage roles" },
            { label: "Project workspaces",         desc: "Scope access at the project level"  },
            { label: "Auth policies per project",  desc: "Custom rules for every deployment"  },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <span
                className="mt-1.5 inline-block w-0.5 h-4 shrink-0 bg-accent"
              />
              <div>
                <p className="font-display text-sm font-semibold text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-xs text-text-muted leading-relaxed">
            Built for teams who need fine-grained control over their SaaS infrastructure.
          </p>
        </div>
      </div>

      {/* ── Right: Form area ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 min-h-screen">

        {/* Mock data banner */}
        <div className="w-full max-w-110 mb-4">
          <MockBanner />
        </div>

        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center bg-accent">
            <Layers size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold">AuthFlow</span>
        </div>

        <div className="w-full max-w-110 animate-slide-up">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
