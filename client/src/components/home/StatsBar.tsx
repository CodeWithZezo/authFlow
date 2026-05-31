// ==================== src/components/home/StatsBar.tsx ====================
import { Counter } from "./Counter";

const STATS = [
  { label: "API endpoints",         value: 40,  suffix: "+" },
  { label: "Single-use refresh",    value: 100, suffix: "%" },
  { label: "Distinct user systems", value: 2,   suffix: ""  },
  { label: "Open source forever",   value: 100, suffix: "%" },
];

export function StatsBar() {
  return (
    <section
      className="border-y"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y divide-x-0 sm:divide-y-0 sm:divide-x" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="py-8 px-4 md:py-14 md:px-10"
              style={{
                borderLeft: i === 0 ? "none" : undefined,
              }}
            >
              <p
                className="font-display font-bold tabular-nums leading-none mb-2"
                style={{
                  fontSize: "clamp(2rem, 8vw, 4rem)",
                  letterSpacing: "-0.04em",
                  color: "var(--color-text-primary)",
                }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="section-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
