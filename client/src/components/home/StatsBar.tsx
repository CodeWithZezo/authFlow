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
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="py-10 md:py-14 px-6 md:px-10"
              style={{
                borderLeft: i === 0 ? "none" : "1px solid var(--color-border)",
              }}
            >
              <p
                className="font-display font-bold tabular-nums leading-none mb-2"
                style={{
                  fontSize: "clamp(2.6rem, 5vw, 4rem)",
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
