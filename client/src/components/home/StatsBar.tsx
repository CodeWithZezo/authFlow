// ==================== src/components/home/StatsBar.tsx ====================
import { Counter } from "./Counter";

const STATS = [
  { label: "API endpoints",       value: 40,  suffix: "+" },
  { label: "Single-use refresh",  value: 100, suffix: "%" },
  { label: "Distinct user systems", value: 2, suffix: "" },
  { label: "Open source forever", value: 100, suffix: "%" },
];

export function StatsBar() {
  return (
    <section
      className="border-y"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-12">
        <div className="grid grid-cols-2 gap-y-8 gap-x-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p
                className="font-display text-3xl md:text-4xl font-bold tabular-nums"
                style={{ color: "var(--color-accent)" }}
              >
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-[11px] md:text-xs" style={{ color: "var(--color-text-muted)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
