// ==================== src/pages/Home.tsx ====================
// AuthFlow — marketing home page.
// Design: dark, minimal, typographic. Syne display + DM Sans body.
// Palette: #08080f bg · #6c63ff accent · clean prose content.

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Lock,
  Cookie,
  RefreshCw,
  Image,
  ArrowRight,
  ChevronRight,
  Copy,
  CheckCheck,
  Globe,
  Database,
  Cloud,
  Eye,
  EyeOff,
  Terminal,
  Layers,
  Settings2,
  Key,
  Zap,
  Activity,
} from "lucide-react";

// ─── Utility ──────────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium transition-colors hover:bg-white/5"
      style={{ color: copied ? "#22c55e" : "var(--color-text-muted)" }}
    >
      {copied ? <CheckCheck size={10} /> : <Copy size={10} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({
  code,
  language = "bash",
  title,
  className,
}: {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-hidden rounded-xl border", className)}
      style={{ borderColor: "var(--color-border)", background: "#050508" }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <div key={c} className="h-2 w-2 rounded-full opacity-60" style={{ background: c }} />
            ))}
          </div>
          {title && (
            <span className="ml-1 font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.04)", color: "var(--color-text-muted)" }}
          >
            {language}
          </span>
          <CopyButton text={code} />
        </div>
      </div>
      <pre
        className="overflow-x-auto p-4 text-xs leading-relaxed"
        style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: "#a8a8c0" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedStat({
  value,
  suffix = "",
  label,
}: {
  value: number;
  suffix?: string;
  label: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1200;
          const step = 16;
          const increment = value / (duration / step);
          const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
              setDisplayed(value);
              clearInterval(timer);
            } else {
              setDisplayed(Math.floor(start));
            }
          }, step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="font-display text-4xl font-black tracking-tight md:text-5xl"
        style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
      >
        {displayed}
        <span style={{ color: "var(--color-accent, #6c63ff)" }}>{suffix}</span>
      </div>
      <div className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Sticky Navbar ────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(8,8,15,0.90)" : "transparent",
        backdropFilter: scrolled ? "blur(24px) saturate(150%)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--color-accent, #6c63ff)" }}
          >
            <Shield size={13} className="text-white" />
          </div>
          <span
            className="font-display text-base font-black tracking-tight"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-display, 'Syne', sans-serif)",
            }}
          >
            AuthFlow
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-7 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "Security", href: "#security" },
            { label: "Quickstart", href: "#quickstart" },
            { label: "API Docs", href: "/docs" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm transition-colors duration-200 hover:text-white"
              style={{ color: "var(--color-text-muted)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden text-sm font-medium transition-colors duration-200 hover:text-white md:block"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:opacity-85"
            style={{ background: "var(--color-accent, #6c63ff)" }}
          >
            Get started
            <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero terminal ────────────────────────────────────────────────────────────
function HeroTerminal() {
  const lines = [
    { delay: 0,    text: "$ curl -X POST /api/v1/project/:id/end-user/signup",   color: "#6c63ff" },
    { delay: 500,  text: "> { email: 'alice@corp.com', password: 'Secure1!' }",   color: "#a8a8c0" },
    { delay: 900,  text: "< HTTP/1.1 201 Created",                                color: "#22c55e" },
    { delay: 1200, text: "< { user: { _id: 'u_x7k…', status: 'active' } }",      color: "#a8a8c0" },
    { delay: 1500, text: "< Set-Cookie: accessToken=eyJ… (httpOnly, 15m)",        color: "#f59e0b" },
    { delay: 1800, text: "< Set-Cookie: refreshToken=eyJ… (httpOnly, 7d)",        color: "#f59e0b" },
    { delay: 2100, text: "✓  User registered. Session established.",               color: "#22c55e" },
  ];

  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    lines.forEach(({ delay }, i) => {
      setTimeout(() => setVisible((prev) => [...prev, i]), delay + 300);
    });
  }, []);

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "#050508" }}
    >
      {/* Terminal chrome */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex gap-1.5">
          {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
            <div key={c} className="h-2 w-2 rounded-full opacity-60" style={{ background: c }} />
          ))}
        </div>
        <div className="ml-3 flex items-center gap-1.5">
          <Terminal size={10} style={{ color: "var(--color-text-muted)" }} />
          <span className="font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            authflow — terminal
          </span>
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-1.5 p-5" style={{ minHeight: 200 }}>
        {lines.map(({ text, color }, i) => (
          <div
            key={i}
            className="font-mono text-xs transition-all duration-500"
            style={{
              color,
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(6px)",
            }}
          >
            {text}
          </div>
        ))}
        {visible.length === lines.length && (
          <span className="font-mono text-xs animate-pulse" style={{ color: "#6c63ff" }}>
            ▋
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "var(--color-accent)",
  badge,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: string;
  badge?: string;
}) {
  return (
    <div
      className="group rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-px"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.015)",
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklch, ${accent} 10%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent} 18%, transparent)`,
          }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        {badge && (
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              color: accent,
              background: `color-mix(in oklch, ${accent} 8%, transparent)`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <h3
        className="mb-2 font-display text-sm font-bold"
        style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {description}
      </p>
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────
function Step({
  number,
  title,
  description,
  code,
  accent,
}: {
  number: number;
  title: string;
  description: string;
  code?: string;
  accent: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border"
      style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-px"
        style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}
      />
      <div className="p-5 pl-6">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
            style={{
              background: `color-mix(in oklch, ${accent} 12%, transparent)`,
              color: accent,
              border: `1px solid color-mix(in oklch, ${accent} 22%, transparent)`,
            }}
          >
            {number}
          </div>
          <h3
            className="font-display text-sm font-bold"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
          >
            {title}
          </h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
        {code && <CodeBlock code={code} language="http" />}
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionPill({
  children,
  accent = "var(--color-accent)",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color: accent,
        background: `color-mix(in oklch, ${accent} 8%, transparent)`,
        borderColor: `color-mix(in oklch, ${accent} 16%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-bg, #08080f)",
        fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
        color: "var(--color-text-primary, #f0f0f8)",
      }}
    >
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:px-10 md:pb-32 md:pt-28">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full opacity-[0.055] blur-[140px]"
            style={{ background: "#6c63ff" }}
          />
          <div
            className="absolute -right-48 top-10 h-[500px] w-[500px] rounded-full opacity-[0.03] blur-[110px]"
            style={{ background: "#38bdf8" }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            {/* Copy */}
            <div>
              <div className="mb-6">
                <SectionPill accent="#22c55e">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  v1.0 — Production Ready
                </SectionPill>
              </div>

              <h1
                className="mb-6 text-4xl font-black leading-[1.06] tracking-tight md:text-5xl lg:text-[3.5rem]"
                style={{
                  fontFamily: "var(--font-display, 'Syne', sans-serif)",
                  color: "var(--color-text-primary)",
                }}
              >
                Complete auth
                <br />
                infrastructure.
                <br />
                <span style={{ color: "var(--color-accent, #6c63ff)" }}>
                  Zero configuration.
                </span>
              </h1>

              <p
                className="mb-8 max-w-md text-base leading-relaxed"
                style={{ color: "var(--color-text-secondary, #9898b0)" }}
              >
                AuthFlow gives your projects a fully managed end-user authentication layer —
                signup, login, avatar uploads, session management, and token rotation — secured
                with httpOnly cookies from day one. Ship your product, not your auth stack.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/signup"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-85 hover:shadow-[0_0_32px_rgba(108,99,255,0.28)]"
                  style={{ background: "var(--color-accent, #6c63ff)" }}
                >
                  Start for free
                  <ArrowRight size={14} />
                </a>
                <a
                  href="/docs"
                  className="flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-200 hover:bg-white/[0.04]"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Terminal size={13} />
                  API Reference
                </a>
              </div>

              {/* Trust pills */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {[
                  { icon: Lock, label: "httpOnly cookies" },
                  { icon: Shield, label: "S3 URLs never exposed" },
                  { icon: RefreshCw, label: "Single-use token rotation" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon size={11} style={{ color: "var(--color-accent, #6c63ff)" }} />
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal */}
            <div>
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section
        className="border-y px-6 py-16 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 md:grid-cols-4">
          <AnimatedStat value={9}  suffix=" endpoints" label="Full auth surface" />
          <AnimatedStat value={15} suffix=" min"       label="Access token TTL" />
          <AnimatedStat value={7}  suffix=" days"      label="Refresh token TTL" />
          <AnimatedStat value={5}  suffix=" MB"        label="Max avatar size" />
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────────────────── */}
      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionPill>Architecture</SectionPill>
            </div>
            <h2
              className="mb-4 font-display text-3xl font-black md:text-4xl"
              style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
            >
              Designed for multi-tenant production
            </h2>
            <p
              className="mx-auto max-w-lg text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Every resource is scoped to a project. Policies control who can register, what
              roles exist, and how passwords must be structured — giving you full authority
              over each application's auth behavior.
            </p>
          </div>

          {/* Architecture flow */}
          <div
            className="mb-14 rounded-2xl border p-8"
            style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
          >
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              {[
                { label: "Your System", icon: Globe, color: "#38bdf8" },
                { label: "AuthFlow API", icon: Shield, color: "#6c63ff", highlight: true },
                { label: "MongoDB", icon: Database, color: "#22c55e" },
                { label: "AWS S3", icon: Cloud, color: "#f59e0b" },
              ].map(({ label, icon: Icon, color, highlight }, i, arr) => (
                <div key={label} className="flex items-center gap-5">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-200 hover:scale-105"
                      style={{
                        borderColor: highlight ? color : `color-mix(in oklch, ${color} 22%, transparent)`,
                        background: `color-mix(in oklch, ${color} 8%, transparent)`,
                        boxShadow: highlight ? `0 0 24px color-mix(in oklch, ${color} 18%, transparent)` : "none",
                      }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    <span
                      className="text-center text-[11px] font-semibold"
                      style={{ color: highlight ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="mb-5 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                      <div className="h-px w-8 sm:w-14" style={{ background: "rgba(255,255,255,0.07)" }} />
                      <ArrowRight size={11} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div
              className="mt-8 grid grid-cols-1 gap-5 border-t pt-7 sm:grid-cols-3"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {[
                { label: "Credential flow", desc: "Browser → API via httpOnly cookie. Tokens are never JavaScript-accessible.", accent: "#38bdf8" },
                { label: "Avatar pipeline", desc: "Browser → API → sharp (400×400) → private S3. The S3 key never leaves the server.", accent: "#f59e0b" },
                { label: "Token lifecycle", desc: "15-minute access tokens. 7-day single-use refresh tokens with automatic rotation.", accent: "#22c55e" },
              ].map(({ label, desc, accent }) => (
                <div key={label}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: accent }}>
                    {label}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature grid */}
          <div id="features" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Multi-tenant by design"
              description="Every user, session, policy, and avatar is scoped to a projectId. Run dozens of independent applications from a single backend without any data bleed."
              accent="#6c63ff"
              badge="Core"
            />
            <FeatureCard
              icon={Settings2}
              title="Policy-driven access control"
              description="Configure allowed auth methods, user roles, account statuses, and password requirements per project. Signup validates against the active policy before creating any record."
              accent="#f59e0b"
            />
            <FeatureCard
              icon={Cookie}
              title="httpOnly cookie auth"
              description="Access and refresh tokens are stored exclusively in httpOnly, SameSite-strict cookies. JavaScript cannot read them — XSS cannot steal what it cannot reach."
              accent="#38bdf8"
            />
            <FeatureCard
              icon={RefreshCw}
              title="Single-use token rotation"
              description="Every refresh token is invalidated upon use and replaced with a fresh one. Attempting to reuse a consumed token triggers an immediate 401 — no second chances."
              accent="#22c55e"
            />
            <FeatureCard
              icon={Image}
              title="Secure avatar streaming"
              description="Avatars are resized to 400×400, EXIF-stripped, and stored in a private S3 bucket. The API streams bytes on request — the S3 URL is never sent to the client."
              accent="#f472b6"
              badge="S3"
            />
            <FeatureCard
              icon={Lock}
              title="Opaque suspension errors"
              description="Suspended users receive the same 404 response as non-existent ones. Callers cannot determine whether a given email is registered, eliminating a common enumeration vector."
              accent="#ef4444"
            />
          </div>
        </div>
      </section>

      {/* ── Quickstart ────────────────────────────────────────────────────── */}
      <section
        id="quickstart"
        className="border-t px-6 py-24 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <div className="mb-4 flex justify-center">
              <SectionPill accent="#22c55e">
                <Terminal size={10} />
                Quickstart
              </SectionPill>
            </div>
            <h2
              className="mb-4 font-display text-3xl font-black md:text-4xl"
              style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
            >
              Up and running in four steps
            </h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Admin setup is a one-time operation. Once your project and policy are configured,
              end-users can register and authenticate immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Step
              number={1}
              title="Create an Organization"
              description="Organizations are top-level containers that group your projects and team members. The registering admin must have a verified account before proceeding."
              code={`POST /api/v1/organizations\nContent-Type: application/json\n\n{ "name": "Acme Corp" }`}
              accent="#6c63ff"
            />
            <Step
              number={2}
              title="Create a Project"
              description="Projects are fully isolated auth environments. Each maintains its own user records, session store, policies, and avatar storage — completely separate from every other project."
              code={`POST /api/v1/organizations/:orgId/projects\nContent-Type: application/json\n\n{ "name": "Mobile App" }`}
              accent="#38bdf8"
            />
            <Step
              number={3}
              title="Configure Policies"
              description="Set a password policy to define strength requirements, and a project policy to specify allowed auth methods, assignable roles, and valid account statuses."
              code={`POST /api/v1/projects/:id/password-policy\nPOST /api/v1/projects/:id/policy`}
              accent="#a78bfa"
            />
            <Step
              number={4}
              title="Begin accepting users"
              description="Your end-user signup endpoint is live. Ensure your frontend includes credentials: 'include' on every request — this is the only integration requirement."
              code={`POST /api/v1/project/:id/end-user/signup\n\n{ "email": "user@example.com",\n  "password": "Secure1!",\n  "authMethod": "email" }`}
              accent="#22c55e"
            />
          </div>

          <div className="mt-8 text-center">
            <a
              href="/docs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 hover:opacity-80"
              style={{ color: "var(--color-accent, #6c63ff)" }}
            >
              View full API reference
              <ChevronRight size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Endpoint table ────────────────────────────────────────────────── */}
      <section
        className="border-t px-6 py-20 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.012)" }}
      >
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-8 font-display text-2xl font-black"
            style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
          >
            All 9 endpoints at a glance
          </h2>
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            {[
              { method: "POST",   path: "/signup",         auth: false, desc: "Register a new end-user against the active project policy" },
              { method: "POST",   path: "/login",          auth: false, desc: "Authenticate and receive httpOnly session cookies" },
              { method: "GET",    path: "/logout",         auth: true,  desc: "Revoke the current session and clear auth cookies" },
              { method: "GET",    path: "/profile",        auth: true,  desc: "Return the authenticated user's profile (sensitive fields excluded)" },
              { method: "PATCH",  path: "/profile",        auth: true,  desc: "Update fullName or phone number" },
              { method: "PATCH",  path: "/avatar",         auth: true,  desc: "Upload, process, and store a new avatar (5 MB max · 400×400 JPEG)" },
              { method: "DELETE", path: "/avatar",         auth: true,  desc: "Remove avatar from S3 and clear the reference in MongoDB" },
              { method: "GET",    path: "/avatar/:userId", auth: true,  desc: "Stream avatar bytes — S3 URL is never exposed to the caller" },
              { method: "POST",   path: "/refresh-token",  auth: false, desc: "Exchange a refresh token for a new access token (single-use rotation)" },
            ].map(({ method, path, auth, desc }) => {
              const palette: Record<string, { text: string; bg: string }> = {
                GET:    { text: "#38bdf8", bg: "rgba(56,189,248,0.08)"  },
                POST:   { text: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
                PATCH:  { text: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
                DELETE: { text: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
              };
              const c = palette[method];
              return (
                <div
                  key={`${method}-${path}`}
                  className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5 last:border-b-0 hover:bg-white/[0.015] transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <span
                    className="w-16 flex-shrink-0 rounded px-2 py-0.5 text-center font-mono text-[10px] font-bold uppercase"
                    style={{ color: c.text, background: c.bg }}
                  >
                    {method}
                  </span>
                  <code
                    className="w-48 flex-shrink-0 font-mono text-xs font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {path}
                  </code>
                  <span
                    className="flex items-center gap-1 text-[10px]"
                    style={{ color: auth ? "#f59e0b" : "#22c55e" }}
                  >
                    <Lock size={8} />
                    {auth ? "Auth required" : "Public"}
                  </span>
                  <span className="flex-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Security ──────────────────────────────────────────────────────── */}
      <section
        id="security"
        className="border-t px-6 py-24 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="mb-5">
                <SectionPill accent="#22c55e">
                  <Shield size={9} />
                  Security
                </SectionPill>
              </div>
              <h2
                className="mb-5 font-display text-3xl font-black leading-tight md:text-4xl"
                style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
              >
                Security is the
                <br />
                default, not an option.
              </h2>
              <p
                className="mb-8 text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Every architectural decision in AuthFlow follows a threat model. Cookie flags,
                S3 bucket policies, bcrypt rounds, and token rotation strategies are not
                configurable afterthoughts — they are the foundation the API is built on.
              </p>

              {/* Fields never returned */}
              <div className="space-y-2">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                  Fields never returned in any response
                </p>
                {[
                  "passwordHash",
                  "avatarKey (S3 internal object key)",
                  "privateMetadata",
                ].map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3"
                    style={{
                      borderColor: "rgba(239,68,68,0.12)",
                      background: "rgba(239,68,68,0.04)",
                    }}
                  >
                    <EyeOff size={12} style={{ color: "#ef4444" }} />
                    <code className="font-mono text-xs font-semibold" style={{ color: "#ef4444" }}>
                      {field}
                    </code>
                    <span className="ml-auto text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                      excluded
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — security cards */}
            <div className="space-y-3">
              {[
                {
                  icon: Cookie,
                  title: "httpOnly on all session cookies",
                  body: "Access and refresh tokens are stored in httpOnly, SameSite-strict cookies. JavaScript running in the browser — including injected XSS payloads — cannot read them.",
                  accent: "#38bdf8",
                },
                {
                  icon: Key,
                  title: "bcrypt with 10 salt rounds",
                  body: "Passwords are hashed with bcrypt, a deliberately slow algorithm. Even with database access, brute-forcing the hash is computationally prohibitive.",
                  accent: "#a78bfa",
                },
                {
                  icon: RefreshCw,
                  title: "Single-use refresh token rotation",
                  body: "Refresh tokens are consumed on use and replaced with a new one. Reusing a consumed token returns an immediate 401 — reuse detection is built into the core auth loop.",
                  accent: "#22c55e",
                },
                {
                  icon: Eye,
                  title: "S3 key excluded at schema level",
                  body: "The internal S3 object key uses Mongoose's select: false, ensuring it is excluded from every query response by default — it cannot accidentally appear in any API response.",
                  accent: "#f59e0b",
                },
              ].map(({ icon: Icon, title, body, accent }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border p-4"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.015)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 10%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${accent} 18%, transparent)`,
                    }}
                  >
                    <Icon size={15} style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {title}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Integration ───────────────────────────────────────────────────── */}
      <section
        className="border-t px-6 py-20 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.012)" }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="mb-4 flex justify-center">
              <SectionPill accent="#a78bfa">
                <Zap size={9} />
                Integration
              </SectionPill>
            </div>
            <h2
              className="mb-3 font-display text-3xl font-black md:text-4xl"
              style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
            >
              One line. Every request.
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Cookie handling is automatic. The only integration requirement is a single
              option on your HTTP client — everything else is handled by the API.
            </p>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <CodeBlock
              title="fetch (native)"
              language="javascript"
              code={`const res = await fetch(url, {\n  credentials: 'include', // ← all you need\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ email, password }),\n});`}
            />
            <CodeBlock
              title="axios"
              language="javascript"
              code={`// Set once, applies globally\naxios.defaults.withCredentials = true;\n\n// Every subsequent request just works\nconst { data } = await axios.post(\n  \`/api/v1/project/\${projectId}/end-user/login\`,\n  { email, password }\n);`}
            />
          </div>

          {/* CORS note */}
          <div
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{ background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.12)" }}
          >
            <Activity size={13} className="mt-px flex-shrink-0" style={{ color: "#f59e0b" }} />
            <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              <strong style={{ color: "#f59e0b" }}>CORS note: </strong>
              The{" "}
              <code className="font-mono" style={{ color: "var(--color-text-primary)" }}>
                CORS_ORIGIN
              </code>{" "}
              environment variable must be set to your exact frontend origin. A wildcard{" "}
              <code className="font-mono">*</code> will not work with credentialed requests —
              the browser will block them.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-t px-6 py-28 md:px-10"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-x-0 top-0 mx-auto h-px max-w-xs"
            style={{ background: "linear-gradient(90deg, transparent, #6c63ff, transparent)" }}
          />
          <div
            className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full opacity-[0.06] blur-[80px]"
            style={{ background: "#6c63ff" }}
          />
        </div>
        <div className="relative mx-auto max-w-xl text-center">
          <h2
            className="mb-5 font-display text-4xl font-black tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
          >
            Ready to ship?
          </h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            AuthFlow handles authentication end-to-end so you can focus on what makes
            your product worth building in the first place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/signup"
              className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-85 hover:shadow-[0_0_40px_rgba(108,99,255,0.3)]"
              style={{ background: "var(--color-accent, #6c63ff)" }}
            >
              Get started for free
              <ArrowRight size={14} />
            </a>
            <a
              href="/docs"
              className="flex items-center gap-2 rounded-xl border px-7 py-3 text-sm font-bold transition-all duration-200 hover:bg-white/[0.04]"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--color-text-secondary)" }}
            >
              <Terminal size={13} />
              Read the docs
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs md:flex-row"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--color-accent, #6c63ff)" }}
            >
              <Shield size={11} className="text-white" />
            </div>
            <span
              className="font-display text-sm font-black"
              style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
            >
              AuthFlow
            </span>
            <span className="opacity-30">·</span>
            <span>End-User API v1.0</span>
          </div>
          <nav className="flex items-center gap-6">
            {["Docs", "Security", "Privacy", "GitHub"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors duration-200 hover:text-white"
              >
                {l}
              </a>
            ))}
          </nav>
          <span>Express · TypeScript · MongoDB · AWS S3</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;