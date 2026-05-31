// ==================== src/components/home/Hero.tsx ====================
import { Link } from "react-router";
import { ArrowRight, Code2 } from "lucide-react";

// ─── Code token helpers ───────────────────────────────────────────────────────
const T = {
  kw:  (s: string) => <span style={{ color: "#c084fc" }}>{s}</span>,
  str: (s: string) => <span style={{ color: "#86efac" }}>{s}</span>,
  fn:  (s: string) => <span style={{ color: "#fb923c" }}>{s}</span>,
  op:  (s: string) => <span style={{ color: "#6b6b6b" }}>{s}</span>,
  cm:  (s: string) => <span style={{ color: "#4a4a4a" }}>{s}</span>,
  var: (s: string) => <span style={{ color: "#ededed" }}>{s}</span>,
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-20 md:pt-24 pb-16 md:pb-24 overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">

        {/* Asymmetric editorial grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">

          {/* ── Left: copy ── */}
          <div>
            {/* Eyebrow */}
            <p
              className="section-label mb-8 animate-fade-in"
              style={{ animationFillMode: "both" }}
            >
              Open Source&nbsp;/&nbsp;Self-Hosted&nbsp;/&nbsp;MIT
            </p>

            {/* Headline */}
            <h1
              className="font-display animate-slide-up mb-6"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                animationDelay: "60ms",
                animationFillMode: "both",
              }}
            >
              <span style={{ color: "var(--color-text-primary)" }}>Authentication</span>
              <br />
              <span style={{ color: "var(--color-accent)" }}>you actually own.</span>
            </h1>

            {/* Subhead */}
            <p
              className="text-base md:text-lg leading-relaxed mb-10 animate-slide-up"
              style={{
                color: "var(--color-text-secondary)",
                maxWidth: "40ch",
                animationDelay: "120ms",
                animationFillMode: "both",
              }}
            >
              Everything Clerk or Auth0 gives you — organizations, multi-tenant projects, JWT
              rotation, RBAC, S3 avatars — except your data never leaves your servers.
              No per-seat pricing. No vendor lock-in.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-start gap-3 animate-slide-up"
              style={{ animationDelay: "180ms", animationFillMode: "both" }}
            >
              <Link
                to="/signup"
                className="group flex items-center gap-2.5 px-7 py-3 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 active:opacity-60"
                style={{ background: "var(--color-accent)", borderRadius: 0 }}
              >
                Start for free
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/docs"
                className="flex items-center gap-2.5 px-7 py-3 text-sm font-medium transition-colors duration-150 hover:bg-white/5"
                style={{
                  border: "1px solid var(--color-border-2)",
                  borderRadius: 0,
                  color: "var(--color-text-secondary)",
                }}
              >
                <Code2 size={14} />
                Read the docs
              </Link>
            </div>

            <p
              className="mt-7 text-xs animate-fade-in"
              style={{
                color: "var(--color-text-muted)",
                animationDelay: "340ms",
                animationFillMode: "both",
              }}
            >
              Deploy to any Node.js host · MongoDB + JWT · AWS S3 for avatars
            </p>
          </div>

          {/* ── Right: terminal panel ── */}
          <div
            className="animate-slide-up"
            style={{ animationDelay: "240ms", animationFillMode: "both" }}
          >
            <div
              className="overflow-hidden border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              {/* Filename bar */}
              <div
                className="flex items-center border-b px-4 py-2.5"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
              >
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
                >
                  quick-setup.ts
                </span>
              </div>

              {/* Code */}
              <div className="overflow-x-auto p-5 md:p-7">
                <pre
                  className="text-[11px] md:text-[13px] leading-7 min-w-[420px]"
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

        </div>
      </div>
    </section>
  );
}
