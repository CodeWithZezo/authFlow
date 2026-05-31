// ==================== src/components/home/CTA.tsx ====================
import { Link } from "react-router";
import { ArrowRight, Code2 } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 md:py-32" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div
          className="border p-10 sm:p-14 md:p-20"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface-2)",
            borderRadius: 0,
          }}
        >
          <p className="section-label mb-6">Free forever · MIT licensed</p>

          <h2
            className="font-display font-bold mb-5"
            style={{
              fontSize: "clamp(1.75rem, 7vw, 3.6rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
              maxWidth: "18ch",
              textWrap: "balance",
            }}
          >
            Own your auth stack.{" "}
            <span style={{ color: "var(--color-accent)" }}>Own your users' data.</span>
          </h2>

          <p
            className="text-sm md:text-base mb-10"
            style={{ color: "var(--color-text-secondary)", maxWidth: "48ch" }}
          >
            No credit card. No vendor agreements. No surprises. Deploy to any
            Node.js host and ship your first authenticated user in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2.5 px-7 py-3 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 active:opacity-60"
              style={{ background: "var(--color-accent)", borderRadius: 0 }}
            >
              Create your account
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/docs"
              className="flex items-center gap-2 px-7 py-3 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
              style={{
                border: "1px solid var(--color-border-2)",
                borderRadius: 0,
                color: "var(--color-text-secondary)",
              }}
            >
              <Code2 size={14} />
              Explore the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
