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
  },
  {
    step: "02",
    icon: FolderKanban,
    title: "Add a Project",
    desc: "Projects live inside orgs. This is the scope for all end-user authentication.",
  },
  {
    step: "03",
    icon: Lock,
    title: "Define Policies",
    desc: "Password Policy first, then Project Policy. Set auth methods, roles, statuses.",
  },
  {
    step: "04",
    icon: Users,
    title: "Users go live",
    desc: "Your customers can now register and log in through the project-scoped API.",
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
      <div className="mx-auto max-w-7xl px-6 sm:px-8">

        <div className="mb-12 md:mb-16">
          <p className="section-label mb-4">How it works</p>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
            }}
          >
            Up and running in four steps
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: "var(--color-text-secondary)", maxWidth: "48ch" }}
          >
            From zero to a fully working multi-tenant auth system. No magic, no surprises.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4 mb-px" style={{ background: "var(--color-border)" }}>
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-6 md:p-7"
                style={{ background: "var(--color-surface-2)", borderRadius: 0 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex h-9 w-9 items-center justify-center shrink-0"
                    style={{
                      background: "var(--color-surface-3)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <Icon size={15} style={{ color: "var(--color-text-secondary)" }} />
                  </div>
                  <span
                    className="font-display font-bold tabular-nums shrink-0"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.08em",
                      color: "var(--color-accent)",
                    }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  className="font-display text-sm font-bold mb-2"
                  style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
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
            );
          })}
        </div>

        {/* Request pipeline */}
        <div
          className="border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)", borderRadius: 0 }}
        >
          <div
            className="border-b px-6 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="section-label" style={{ fontSize: "9px" }}>Request pipeline</p>
          </div>
          <div className="p-4 md:p-6 overflow-x-auto">
            <div className="flex items-center gap-1.5 w-fit">
              {FLOW.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={node.label} className="flex items-center gap-1.5">
                    <div
                      className="flex flex-col items-center gap-1.5 border px-3 md:px-4 py-2.5 md:py-3 min-w-20 md:min-w-24"
                      style={{
                        borderColor: "var(--color-border-2)",
                        background: "var(--color-surface-2)",
                        borderRadius: 0,
                      }}
                    >
                      <Icon size={13} style={{ color: "var(--color-accent)" }} />
                      <span
                        className="text-[10px] font-medium text-center whitespace-nowrap"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {node.label}
                      </span>
                    </div>
                    {i < FLOW.length - 1 && (
                      <ChevronRight
                        size={11}
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
