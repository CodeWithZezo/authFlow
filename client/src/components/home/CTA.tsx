// ==================== src/components/home/CTA.tsx ====================
import { Link } from "react-router";
import { ArrowRight, Code2, Star } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-32" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl border p-8 sm:p-12 md:p-16 text-center"
          style={{ borderColor: "rgba(108,99,255,0.22)", background: "var(--color-surface-2)" }}
        >
          {/* Orb */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] md:h-[600px] md:w-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)" }}
          />
          {/* Dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(108,99,255,0.10) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
            }}
          />

          <div className="relative z-10 space-y-5 md:space-y-7">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] md:text-xs font-semibold"
              style={{
                borderColor: "rgba(108,99,255,0.28)",
                background: "rgba(108,99,255,0.07)",
                color: "var(--color-accent)",
              }}
            >
              <Star size={10} />
              Free forever · MIT licensed
            </div>

            <h2
              className="font-display text-3xl md:text-4xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
            >
              Own your auth stack.
              <br />Own your users' data.
            </h2>

            <p
              className="mx-auto max-w-lg text-sm md:text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No credit card. No vendor agreements. No surprises. Deploy to any
              Node.js host and ship your first authenticated user in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-1 md:pt-2">
              <Link
                to="/signup"
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl px-7 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(108,99,255,0.45)]"
                style={{ background: "var(--color-accent)", boxShadow: "0 0 28px rgba(108,99,255,0.3)" }}
              >
                Create your account
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/docs"
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")}
              >
                <Code2 size={14} />
                Explore the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
