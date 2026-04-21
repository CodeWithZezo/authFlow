// ==================== src/components/home/Hero.tsx ====================
import { Link } from "react-router";
import { ArrowRight, Code2, Terminal } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";

// ─── Code token helpers ───────────────────────────────────────────────────────
const T = {
  kw:  (s: string) => <span style={{ color: "#c084fc" }}>{s}</span>,
  str: (s: string) => <span style={{ color: "#86efac" }}>{s}</span>,
  fn:  (s: string) => <span style={{ color: "#60a5fa" }}>{s}</span>,
  op:  (s: string) => <span style={{ color: "#8888aa" }}>{s}</span>,
  cm:  (s: string) => <span style={{ color: "#44445a" }}>{s}</span>,
  var: (s: string) => <span style={{ color: "#f2f2ff" }}>{s}</span>,
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14 md:pt-16">
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 md:-top-48 left-1/2 -translate-x-1/2 h-[400px] w-[400px] md:h-[700px] md:w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -left-24 md:-left-48 h-[250px] w-[250px] md:h-[450px] md:w-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.10) 0%, transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 -right-24 md:-right-48 h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 60%)" }}
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(108,99,255,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6 text-center">

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] md:text-xs font-semibold mb-7 md:mb-9 animate-slide-up"
          style={{
            borderColor: "rgba(108,99,255,0.28)",
            background: "rgba(108,99,255,0.07)",
            color: "var(--color-accent)",
            animationFillMode: "both",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "var(--color-accent)" }}
          />
          Open-source · Self-hosted · MIT licensed
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold tracking-tight mb-5 md:mb-6 animate-slide-up"
          style={{
            fontSize: "clamp(2rem, 8vw, 5.2rem)",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            animationDelay: "80ms",
            animationFillMode: "both",
          }}
        >
          <span style={{ color: "var(--color-text-primary)" }}>Authentication</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #6c63ff 0%, #38bdf8 50%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            you actually own.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto max-w-xl md:max-w-2xl text-base md:text-lg leading-relaxed mb-8 md:mb-10 animate-slide-up"
          style={{ color: "var(--color-text-secondary)", animationDelay: "160ms", animationFillMode: "both" }}
        >
          Everything Clerk or Auth0 gives you — organizations, multi-tenant projects, JWT
          rotation, RBAC, S3 avatars — except your data never leaves your servers.
          No per-seat pricing. No vendor lock-in.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-slide-up"
          style={{ animationDelay: "240ms", animationFillMode: "both" }}
        >
          <Link
            to="/signup"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl px-7 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(108,99,255,0.45)] active:scale-[0.98]"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 26px rgba(108,99,255,0.32)" }}
          >
            Start for free
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/docs"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl border px-7 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-medium transition-all duration-200 hover:bg-white/5"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            <Code2 size={15} />
            Read the docs
          </Link>
        </div>

        <p
          className="mt-6 md:mt-7 text-[11px] md:text-xs animate-fade-in px-4"
          style={{ color: "var(--color-text-muted)", animationDelay: "420ms", animationFillMode: "both" }}
        >
          Deploy to any Node.js host · MongoDB + JWT · AWS S3 for avatars
        </p>
      </div>

      {/* Terminal preview */}
      <div
        className="relative z-10 mx-auto mt-10 md:mt-16 w-full max-w-3xl px-4 sm:px-6 animate-slide-up"
        style={{ animationDelay: "340ms", animationFillMode: "both" }}
      >
        <div
          className="overflow-hidden rounded-xl md:rounded-2xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
            boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 70px rgba(108,99,255,0.07)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 border-b px-4 md:px-5 py-3 md:py-3.5"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-500/75" />
            <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-yellow-500/75" />
            <span className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-500/75" />
            <div
              className="ml-2 flex items-center gap-1.5 rounded-lg border px-2.5 py-1"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)" }}
            >
              <Terminal size={10} style={{ color: "var(--color-text-muted)" }} />
              <span className="text-[11px] md:text-xs" style={{ color: "var(--color-text-muted)" }}>
                Quick setup
              </span>
            </div>
          </div>

          {/* Code — scrollable on mobile */}
          <div className="overflow-x-auto p-4 md:p-7">
            <pre
              className="text-[11px] md:text-sm leading-7 md:leading-8 min-w-[480px]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>{T.cm("// 1. Create your organization")}</div>
              <div>
                {T.kw("const")} {T.var("org")} {T.op("=")} {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(")}{T.str("'/api/v1/organizations'")}{T.op(",")} {T.op("{ method: 'POST', body: JSON.stringify({ name: 'Acme' }) })")}
              </div>
              <br />
              <div>{T.cm("// 2. Create a project inside it")}</div>
              <div>
                {T.kw("const")} {T.var("project")} {T.op("=")} {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(`/api/v1/organizations/${")}
                {T.var("org")}{T.op(".id}/projects`,")} {T.op("{ method: 'POST' })")}
              </div>
              <br />
              <div>{T.cm("// 3. Set a password policy, then a project policy")}</div>
              <div>
                {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(`/api/v1/projects/${")}
                {T.var("project")}{T.op(".id}/password-policy`,")} {T.op("{ method: 'POST' })")}
              </div>
              <br />
              <div>{T.cm("// 4. End-user endpoints are now live  🎉")}</div>
              <div>
                {T.kw("await")} {T.fn("fetch")}
                {T.op("(`/api/v1/project/${")}
                {T.var("project")}{T.op(".id}/end-user/signup`,")} {T.op("{ credentials: 'include' })")}
              </div>
            </pre>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="flex h-7 w-4 md:h-8 md:w-5 items-start justify-center rounded-full border p-1"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            className="h-1.5 w-0.5 rounded-full animate-bounce"
            style={{ background: "var(--color-text-muted)" }}
          />
        </div>
      </div>
    </section>
  );
}
