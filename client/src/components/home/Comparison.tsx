// ==================== src/components/home/Comparison.tsx ====================
import { Check } from "lucide-react";

const COMPARE_ROWS = [
  { feature: "Self-hosted",              AuthFlow: true,  clerk: false, auth0: false },
  { feature: "No per-seat pricing",      AuthFlow: true,  clerk: false, auth0: false },
  { feature: "Data on your servers",     AuthFlow: true,  clerk: false, auth0: false },
  { feature: "JWT rotation",             AuthFlow: true,  clerk: true,  auth0: true  },
  { feature: "Organizations",            AuthFlow: true,  clerk: true,  auth0: true  },
  { feature: "Custom password policies", AuthFlow: true,  clerk: false, auth0: true  },
  { feature: "Project-scoped auth",      AuthFlow: true,  clerk: false, auth0: false },
  { feature: "Avatar pipeline",          AuthFlow: true,  clerk: true,  auth0: false },
  { feature: "Session revocation",       AuthFlow: true,  clerk: true,  auth0: true  },
  { feature: "Open source",             AuthFlow: true,  clerk: false, auth0: false },
];

export function Comparison() {
  return (
    <section id="compare" className="py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">

        <div className="mb-12 md:mb-16">
          <p className="section-label mb-4">Comparison</p>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
            }}
          >
            Why self-host?
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: "var(--color-text-secondary)", maxWidth: "44ch" }}
          >
            You get the complete feature set — without the ongoing SaaS bill.
          </p>
        </div>

        <div
          className="overflow-hidden border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 0 }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-4 border-b px-4 sm:px-6 py-3 md:py-4"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div />
            {["AuthFlow", "Clerk", "Auth0"].map((name, i) => (
              <div key={name} className="text-center">
                <span
                  className={i === 0 ? "section-label" : "section-label"}
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
              className="grid grid-cols-4 px-4 sm:px-6 py-3 md:py-3.5 items-center"
              style={{
                borderBottom: i < COMPARE_ROWS.length - 1 ? "1px solid var(--color-border)" : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
              }}
            >
              <span
                className="text-[11px] sm:text-sm pr-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {row.feature}
              </span>
              {[row.AuthFlow, row.clerk, row.auth0].map((val, j) => (
                <div key={j} className="flex justify-center">
                  {val ? (
                    <Check
                      size={14}
                      style={{ color: j === 0 ? "var(--color-accent)" : "var(--color-text-secondary)" }}
                    />
                  ) : (
                    <span
                      className="h-px w-3 md:w-4 inline-block"
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
