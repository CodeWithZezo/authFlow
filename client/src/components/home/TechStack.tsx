// ==================== src/components/home/TechStack.tsx ====================

const TECH = [
  { name: "Node.js 18+",    color: "#68a063" },
  { name: "TypeScript",     color: "#3178c6" },
  { name: "Express.js",     color: "#f2f2ff" },
  { name: "MongoDB",        color: "#22c55e" },
  { name: "JWT",            color: "#f59e0b" },
  { name: "AWS S3",         color: "#ff9900" },
  { name: "bcrypt",         color: "#ec4899" },
  { name: "sharp",          color: "#66cc00" },
  { name: "React",          color: "#38bdf8" },
  { name: "Tailwind v4",    color: "#38bdf8" },
  { name: "Zustand",        color: "#f97316" },
  { name: "Helmet + CORS",  color: "#a78bfa" },
];

export function TechStack() {
  return (
    <section
      className="py-12 md:py-16 border-y"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p
          className="text-center text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Proven open-source technology
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-2.5">
          {TECH.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-1.5 md:gap-2 rounded-full border px-3 md:px-4 py-1 md:py-1.5 transition-colors"
              style={{ borderColor: `${t.color}20`, background: `${t.color}08` }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: t.color }}
              />
              <span
                className="text-[11px] md:text-xs font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
