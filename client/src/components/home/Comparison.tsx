// ==================== src/components/home/Comparison.tsx ====================
import { Check } from "lucide-react";

const COMPARE_ROWS = [
  { feature: "Self-hosted",              nexus: true,  clerk: false, auth0: false },
  { feature: "No per-seat pricing",      nexus: true,  clerk: false, auth0: false },
  { feature: "Data on your servers",     nexus: true,  clerk: false, auth0: false },
  { feature: "JWT rotation",             nexus: true,  clerk: true,  auth0: true  },
  { feature: "Organizations",            nexus: true,  clerk: true,  auth0: true  },
  { feature: "Custom password policies", nexus: true,  clerk: false, auth0: true  },
  { feature: "Project-scoped auth",      nexus: true,  clerk: false, auth0: false },
  { feature: "Avatar pipeline",          nexus: true,  clerk: true,  auth0: false },
  { feature: "Session revocation",       nexus: true,  clerk: true,  auth0: true  },
  { feature: "Open source",             nexus: true,  clerk: false, auth0: false },
];

export function Comparison() {
  return (
    <section id="compare" className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 md:mb-16 text-center">
          <p
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            Comparison
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Why self-host?
          </h2>
          <p className="text-sm md:text-base" style={{ color: "var(--color-text-secondary)" }}>
            You get the complete feature set — without the ongoing SaaS bill.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-xl md:rounded-2xl border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-4 border-b px-3 sm:px-6 py-3 md:py-4"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div />
            {["Nexus", "Clerk", "Auth0"].map((name, i) => (
              <div key={name} className="text-center">
                <span
                  className="font-display text-xs md:text-sm font-bold"
                  style={{ color: i === 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-4 px-3 sm:px-6 py-3 md:py-3.5 items-center"
              style={{
                borderBottom:
                  i < COMPARE_ROWS.length - 1 ? "1px solid var(--color-border)" : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}
            >
              <span
                className="text-[11px] sm:text-sm pr-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {row.feature}
              </span>
              {[row.nexus, row.clerk, row.auth0].map((val, j) => (
                <div key={j} className="flex justify-center">
                  {val ? (
                    <Check
                      size={14}
                      style={{ color: j === 0 ? "var(--color-accent)" : "var(--color-success)" }}
                    />
                  ) : (
                    <span
                      className="h-0.5 w-3 md:w-4 rounded-full inline-block"
                      style={{ background: "var(--color-border-2)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
