// ==================== src/components/home/Architecture.tsx ====================
import {
  Building2, FolderKanban, Lock, Users,
  Globe, Server, Shield, Code2, GitBranch, Database,
  ChevronRight, type LucideIcon,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Building2,
    title: "Create an Organization",
    desc: "Your top-level workspace. Pick a unique slug. You automatically become the owner.",
    accent: "#6c63ff",
  },
  {
    step: "02",
    icon: FolderKanban,
    title: "Add a Project",
    desc: "Projects live inside orgs. This is the scope for all end-user authentication.",
    accent: "#38bdf8",
  },
  {
    step: "03",
    icon: Lock,
    title: "Define Policies",
    desc: "Password Policy first, then Project Policy. Set auth methods, roles, statuses.",
    accent: "#f59e0b",
  },
  {
    step: "04",
    icon: Users,
    title: "Users go live",
    desc: "Your customers can now register and log in through the project-scoped API.",
    accent: "#22c55e",
  },
];

const FLOW: { label: string; icon: LucideIcon }[] = [
  { label: "Client",           icon: Globe },
  { label: "Express",          icon: Server },
  { label: "authenticate()",   icon: Lock },
  { label: "roleAuthorize()",  icon: Shield },
  { label: "Controller",       icon: Code2 },
  { label: "Service",          icon: GitBranch },
  { label: "MongoDB",          icon: Database },
];

export function Architecture() {
  return (
    <section
      id="architecture"
      className="py-20 md:py-32"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 md:mb-16 text-center max-w-2xl mx-auto">
          <p
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            How it works
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Up and running in four steps
          </h2>
          <p className="text-sm md:text-base" style={{ color: "var(--color-text-secondary)" }}>
            From zero to a fully working multi-tenant auth system. No magic, no surprises.
          </p>
        </div>

        {/* Steps grid — 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10 md:mb-14">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                {/* Connector line — desktop only */}
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute top-9 left-[calc(100%-8px)] hidden lg:block h-px z-0"
                    style={{
                      width: "calc(100% - 16px)",
                      background: `linear-gradient(90deg, ${s.accent}50, ${STEPS[i + 1].accent}20)`,
                    }}
                  />
                )}
                <div
                  className="relative z-10 rounded-xl md:rounded-2xl border p-5 md:p-6 h-full"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  <div className="flex items-center gap-3 mb-4 md:mb-5">
                    <div
                      className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg md:rounded-xl flex-shrink-0"
                      style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}28` }}
                    >
                      <Icon size={17} style={{ color: s.accent }} />
                    </div>
                    <span
                      className="font-display text-[10px] md:text-xs font-bold tracking-widest"
                      style={{ color: s.accent }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3
                    className="font-display text-[13px] md:text-sm font-bold mb-1.5 md:mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-[12px] md:text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Request pipeline — horizontally scrollable on mobile */}
        <div>
          <p
            className="text-center text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            Request pipeline
          </p>
          <div
            className="rounded-xl md:rounded-2xl border p-4 md:p-6 overflow-x-auto"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)" }}
          >
            <div className="flex items-center gap-1.5 w-fit mx-auto">
              {FLOW.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={node.label} className="flex items-center gap-1.5">
                    <div
                      className="flex flex-col items-center gap-1.5 md:gap-2 rounded-lg md:rounded-xl border px-3 md:px-4 py-2.5 md:py-3 min-w-[80px] md:min-w-[100px]"
                      style={{
                        borderColor: "var(--color-border-2)",
                        background: "var(--color-surface-2)",
                      }}
                    >
                      <Icon size={13} style={{ color: "var(--color-accent)" }} />
                      <span
                        className="text-[10px] md:text-xs font-medium text-center whitespace-nowrap"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {node.label}
                      </span>
                    </div>
                    {i < FLOW.length - 1 && (
                      <ChevronRight
                        size={12}
                        style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
