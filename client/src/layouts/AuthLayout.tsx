// ==================== src/layouts/AuthLayout.tsx ====================
import { Outlet } from "react-router";
import { Layers } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">

      {/* ── Left: Brand panel ──────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[46%] flex-col justify-between overflow-hidden bg-[var(--color-surface)] border-r border-[var(--color-border)] p-12">

        {/* Ambient gradient orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, #6c63ff18 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, #6c63ff10 0%, transparent 70%)" }}
        />

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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] shadow-[var(--shadow-glow)]">
            <Layers size={18} className="text-white" />
          </div>
          <span
            className="font-display text-xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Nexus
          </span>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          {/* Feature list */}
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
              <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Built for teams who need fine-grained control over their SaaS infrastructure.
          </p>
        </div>
      </div>

      {/* ── Right: Form area ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">

        {/* Mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent)]">
            <Layers size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold">Nexus</span>
        </div>

        <div className="w-full max-w-[400px] animate-slide-up">
          <Outlet />
        </div>
      </div>

    </div>
  );
}
