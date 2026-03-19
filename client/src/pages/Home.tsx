// ==================== src/routes/_app/Home.tsx ====================
// AuthFlow marketing home page.
// Matches: Syne + DM Sans, #09090f bg, #6c63ff accent, same design system as EndUserApiDocs.tsx

import { useState, useEffect, useRef } from "react";
import {
  Shield,
  Lock,
  Zap,
  Users,
  Key,
  Cookie,
  RefreshCw,
  Image,
  ArrowRight,
  ChevronRight,
  Check,
  Copy,
  CheckCheck,
  Globe,
  Database,
  Code2,
  Layers,
  Settings,
  Eye,
  EyeOff,
  Star,
  GitBranch,
  Terminal,
  Cpu,
  Cloud,
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
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:bg-white/5"
      style={{ color: copied ? "#22c55e" : "var(--color-text-muted)" }}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
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
      style={{ borderColor: "var(--color-border)", background: "#0a0a12" }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
            <div key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
          ))}
          {title && (
            <span className="ml-1 font-mono text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
          >
            {language}
          </span>
          <CopyButton text={code} />
        </div>
      </div>
      <pre
        className="overflow-x-auto p-4 text-xs leading-relaxed"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedStat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1400;
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
        style={{ color: "var(--color-text-primary)" }}
      >
        {displayed.toLocaleString()}
        <span style={{ color: "var(--color-accent)" }}>{suffix}</span>
      </div>
      <div className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {label}
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
  tag,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: string;
  tag?: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(108,99,255,0.08)]"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), color-mix(in oklch, ${accent} 6%, transparent), transparent 60%)`,
        }}
      />
      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: `color-mix(in oklch, ${accent} 12%, transparent)`,
              border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)`,
            }}
          >
            <Icon size={18} style={{ color: accent }} />
          </div>
          {tag && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: accent, background: `color-mix(in oklch, ${accent} 10%, transparent)` }}
            >
              {tag}
            </span>
          )}
        </div>
        <h3
          className="mb-2 font-display text-base font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({
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
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-0.5"
        style={{ background: `linear-gradient(to bottom, ${accent}, transparent)` }}
      />
      <div className="p-5 pl-6">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-black"
            style={{
              background: `color-mix(in oklch, ${accent} 15%, transparent)`,
              color: accent,
              border: `1px solid color-mix(in oklch, ${accent} 25%, transparent)`,
            }}
          >
            {number}
          </div>
          <h3
            className="font-display text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h3>
        </div>
        <p className="mb-3 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
        {code && (
          <CodeBlock code={code} language="bash" />
        )}
      </div>
    </div>
  );
}

// ─── Pill badge ───────────────────────────────────────────────────────────────
function Pill({ children, accent = "var(--color-accent)" }: { children: React.ReactNode; accent?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
      style={{
        color: accent,
        background: `color-mix(in oklch, ${accent} 10%, transparent)`,
        borderColor: `color-mix(in oklch, ${accent} 20%, transparent)`,
      }}
    >
      {children}
    </span>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(9,9,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "var(--color-accent)" }}
          >
            <Shield size={15} className="text-white" />
          </div>
          <span
            className="font-display text-lg font-black"
            style={{ color: "var(--color-text-primary)" }}
          >
            AuthFlow
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {["Docs", "Features", "Security", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm transition-colors hover:text-white"
              style={{ color: "var(--color-text-muted)" }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <a
            href="/docs"
            className="hidden text-sm font-medium transition-colors hover:text-white md:block"
            style={{ color: "var(--color-text-secondary)" }}
          >
            API Docs
          </a>
          <a
            href="/signup"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "var(--color-accent)" }}
          >
            Get Started
            <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero terminal mockup ──────────────────────────────────────────────────────
function HeroTerminal() {
  const lines = [
    { delay: 0,    text: "$ curl -X POST /api/v1/project/:id/end-user/signup", color: "#22c55e" },
    { delay: 600,  text: "> { email: 'jane@acme.com', password: 'Secure123!' }", color: "var(--color-text-muted)" },
    { delay: 1100, text: "< 201 Created", color: "#38bdf8" },
    { delay: 1400, text: "< { user: { _id: '664abc…', email: 'jane@acme.com',", color: "var(--color-text-secondary)" },
    { delay: 1600, text: "<     role: 'user', status: 'active', avatarUrl: null } }", color: "var(--color-text-secondary)" },
    { delay: 1900, text: "< Set-Cookie: accessToken=eyJ… (httpOnly, 15m)", color: "#f59e0b" },
    { delay: 2200, text: "< Set-Cookie: refreshToken=eyJ… (httpOnly, 7d)", color: "#f59e0b" },
    { delay: 2600, text: "✓ User authenticated. Tokens stored securely.", color: "#22c55e" },
  ];

  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    lines.forEach(({ delay }, i) => {
      setTimeout(() => setVisible((prev) => [...prev, i]), delay + 400);
    });
  }, []);

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--color-border)", background: "#060609" }}
    >
      {/* Terminal header */}
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
          <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        ))}
        <div className="ml-2 flex items-center gap-1.5">
          <Terminal size={11} style={{ color: "var(--color-text-muted)" }} />
          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>
            authflow — bash
          </span>
        </div>
      </div>
      {/* Terminal body */}
      <div className="space-y-1.5 p-5" style={{ minHeight: 220 }}>
        {lines.map(({ text, color }, i) => (
          <div
            key={i}
            className="flex items-start gap-2 font-mono text-xs transition-all duration-500"
            style={{
              color,
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(6px)",
            }}
          >
            <span className="font-mono">{text}</span>
          </div>
        ))}
        {visible.length === lines.length && (
          <div className="mt-2 flex items-center gap-1 font-mono text-xs" style={{ color: "#22c55e" }}>
            <span className="animate-pulse">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Architecture diagram  ────────────────────────────────────────────────────
function ArchDiagram() {
  const nodes = [
    { label: "Your Frontend", icon: Globe, color: "#38bdf8", x: 0 },
    { label: "AuthFlow API", icon: Shield, color: "#6c63ff", x: 1, highlight: true },
    { label: "MongoDB", icon: Database, color: "#22c55e", x: 2 },
    { label: "AWS S3", icon: Cloud, color: "#f59e0b", x: 3 },
  ];

  return (
    <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-center">
      {nodes.map(({ label, icon: Icon, color, highlight }, i) => (
        <div key={label} className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform hover:scale-105"
              style={{
                borderColor: highlight
                  ? "var(--color-accent)"
                  : `color-mix(in oklch, ${color} 25%, transparent)`,
                background: `color-mix(in oklch, ${color} 10%, transparent)`,
                boxShadow: highlight ? `0 0 20px color-mix(in oklch, ${color} 20%, transparent)` : "none",
              }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <span
              className="text-center text-[11px] font-semibold"
              style={{ color: highlight ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
            >
              {label}
            </span>
          </div>
          {i < nodes.length - 1 && (
            <div className="flex items-center gap-1 mb-5" style={{ color: "var(--color-text-muted)" }}>
              <div className="h-px w-6 sm:w-10" style={{ background: "var(--color-border)" }} />
              <ArrowRight size={12} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
 function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--color-bg, #09090f)",
        fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
        color: "var(--color-text-primary, #f8f8ff)",
      }}
    >
      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        {/* Ambient bg glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.06] blur-[120px]"
            style={{ background: "var(--color-accent, #6c63ff)" }}
          />
          <div
            className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-[100px]"
            style={{ background: "#38bdf8" }}
          />
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-border, rgba(255,255,255,0.08)) 1px, transparent 1px), linear-gradient(90deg, var(--color-border, rgba(255,255,255,0.08)) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left copy */}
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <Pill accent="#22c55e">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  v1.0 — Now Available
                </Pill>
                <Pill accent="#38bdf8">
                  <Code2 size={10} />
                  REST API
                </Pill>
              </div>

              <h1
                className="mb-5 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", color: "var(--color-text-primary)" }}
              >
                Auth infrastructure
                <br />
                <span style={{ color: "var(--color-accent, #6c63ff)" }}>
                  for every project.
                </span>
              </h1>

              <p
                className="mb-8 max-w-lg text-lg leading-relaxed"
                style={{ color: "var(--color-text-secondary, #a0a0b8)" }}
              >
                A complete end-user authentication API — signup, login, avatars, sessions — scoped per project, secured with httpOnly cookies, and designed to never expose your S3 URLs.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/signup"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(108,99,255,0.3)]"
                  style={{ background: "var(--color-accent, #6c63ff)" }}
                >
                  Start for free
                  <ArrowRight size={15} />
                </a>
                <a
                  href="/docs"
                  className="flex items-center gap-2 rounded-xl border px-6 py-3 font-bold transition-all hover:bg-white/5"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Code2 size={15} />
                  Read the docs
                </a>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {[
                  { icon: Lock, text: "httpOnly cookies" },
                  { icon: Shield, text: "S3 URL never exposed" },
                  { icon: RefreshCw, text: "Token rotation" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon size={12} style={{ color: "var(--color-accent)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right terminal */}
            <div>
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section
        className="border-y px-6 py-14 md:px-10"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 md:grid-cols-4">
          <AnimatedStat value={9} suffix=" endpoints" label="Full Auth Surface" />
          <AnimatedStat value={5} suffix=" MB" label="Max Avatar Size" />
          <AnimatedStat value={15} suffix=" min" label="Access Token TTL" />
          <AnimatedStat value={7} suffix=" days" label="Refresh Token TTL" />
        </div>
      </section>

      {/* ── Architecture ──────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 flex justify-center">
              <Pill>
                <Cpu size={10} />
                Architecture
              </Pill>
            </div>
            <h2
              className="mb-4 font-display text-3xl font-black md:text-4xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              Built for real production use
            </h2>
            <p className="mx-auto max-w-xl text-base" style={{ color: "var(--color-text-secondary)" }}>
              Every request is scoped to a project. Policies enforce who can sign up, what roles exist, and how passwords must look.
            </p>
          </div>

          <div
            className="mb-12 overflow-hidden rounded-2xl border p-8"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
          >
            <ArchDiagram />
            <div
              className="mt-6 border-t pt-6"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Credentials flow", value: "Browser → API (httpOnly cookie, never JS-accessible)", color: "#38bdf8" },
                  { label: "Avatar pipeline", value: "Browser → API → sharp → S3 (key never leaves server)", color: "#f59e0b" },
                  { label: "Token lifecycle", value: "15 min access + 7 day refresh, single-use rotation", color: "#22c55e" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Layers}
              title="Multi-tenant by design"
              description="Every resource — users, policies, sessions, avatars — is scoped to a projectId. Run dozens of independent apps from one backend."
              accent="#6c63ff"
              tag="Core"
            />
            <FeatureCard
              icon={Settings}
              title="Policy-driven signup"
              description="Define allowed auth methods, roles, statuses, and password rules per project. Signup validates against the policy before creating anyone."
              accent="#f59e0b"
            />
            <FeatureCard
              icon={Cookie}
              title="httpOnly cookie auth"
              description="Access and refresh tokens live in httpOnly cookies — never localStorage. XSS can't steal what JavaScript can't read."
              accent="#38bdf8"
            />
            <FeatureCard
              icon={RefreshCw}
              title="Token rotation"
              description="Each refresh token is single-use. Using it invalidates itself and creates a fresh session. Reusing a revoked token gets a hard 401."
              accent="#22c55e"
            />
            <FeatureCard
              icon={Image}
              title="Secure avatar streaming"
              description="Avatars are processed with sharp (400×400, EXIF stripped), stored in a private S3 bucket, and streamed through the API — S3 URLs are never exposed."
              accent="#f472b6"
              tag="S3"
            />
            <FeatureCard
              icon={Lock}
              title="Suspended user blocking"
              description="Suspended users are treated as non-existent. Login returns 404, not 403 — no information leakage about account existence."
              accent="#ef4444"
            />
          </div>
        </div>
      </section>

      {/* ── Quick Start ───────────────────────────────────────────────────── */}
      <section
        id="docs"
        className="border-t px-6 py-20 md:px-10"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-3 flex justify-center">
              <Pill accent="#22c55e">
                <Terminal size={10} />
                Quick Start
              </Pill>
            </div>
            <h2
              className="mb-4 font-display text-3xl font-black md:text-4xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
            >
              Up and running in 4 steps
            </h2>
            <p className="mx-auto max-w-lg text-base" style={{ color: "var(--color-text-secondary)" }}>
              Admin setup takes minutes. Once your project policy is configured, end-users can sign up immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StepCard
              number={1}
              title="Create an Organization"
              description="The creating admin must have isVerified = true. Organizations are the top-level container for all your projects."
              code={`POST /api/v1/organizations
{ "name": "Acme Corp" }`}
              accent="#6c63ff"
            />
            <StepCard
              number={2}
              title="Create a Project"
              description="Projects are isolated auth environments. Each has its own users, policies, and sessions."
              code={`POST /api/v1/organizations/:orgId/projects
{ "name": "Mobile App" }`}
              accent="#38bdf8"
            />
            <StepCard
              number={3}
              title="Configure Policies"
              description="Set a password policy and project policy to control who can sign up, what roles exist, and password strength rules."
              code={`POST /api/v1/projects/:id/password-policy
POST /api/v1/projects/:id/policy`}
              accent="#a78bfa"
            />
            <StepCard
              number={4}
              title="Start registering users"
              description="Your end-user signup endpoint is ready. Frontend just needs credentials: 'include' on every fetch."
              code={`POST /api/v1/project/:projectId/end-user/signup
{ email, password, authMethod: 'email' }`}
              accent="#22c55e"
            />
          </div>

          <div className="mt-8 text-center">
            <a
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
              style={{ color: "var(--color-accent)" }}
            >
              Full API Reference
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Endpoint reference strip ──────────────────────────────────────── */}
      <section
        className="border-t px-6 py-16 md:px-10"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="mx-auto max-w-6xl">
          <h2
            className="mb-8 font-display text-2xl font-black"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            All 9 endpoints at a glance
          </h2>
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--color-border)" }}>
            {[
              { method: "POST",   path: "/signup",        auth: false, desc: "Register a new end-user against the project policy" },
              { method: "POST",   path: "/login",         auth: false, desc: "Authenticate and receive httpOnly tokens in cookies" },
              { method: "GET",    path: "/logout",        auth: true,  desc: "Revoke session and clear auth cookies" },
              { method: "GET",    path: "/profile",       auth: true,  desc: "Fetch full user profile — sensitive fields excluded" },
              { method: "PATCH",  path: "/profile",       auth: true,  desc: "Update fullName or phone" },
              { method: "PATCH",  path: "/avatar",        auth: true,  desc: "Upload and process avatar image (5 MB · 400×400 JPEG)" },
              { method: "DELETE", path: "/avatar",        auth: true,  desc: "Remove avatar from S3 and MongoDB" },
              { method: "GET",    path: "/avatar/:userId",auth: true,  desc: "Stream avatar bytes — S3 URL never exposed to client" },
              { method: "POST",   path: "/refresh-token", auth: false, desc: "Exchange refresh token for a new access token (rotation)" },
            ].map(({ method, path, auth, desc }, i) => {
              const colors: Record<string, { text: string; bg: string }> = {
                GET:    { text: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
                POST:   { text: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                PATCH:  { text: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                DELETE: { text: "#ef4444", bg: "rgba(239,68,68,0.1)" },
              };
              const c = colors[method];
              return (
                <div
                  key={`${method}${path}`}
                  className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span
                    className="w-16 flex-shrink-0 rounded px-2 py-0.5 text-center font-mono text-[11px] font-bold uppercase"
                    style={{ color: c.text, background: c.bg }}
                  >
                    {method}
                  </span>
                  <code
                    className="w-52 flex-shrink-0 font-mono text-xs font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {path}
                  </code>
                  <span
                    className="flex items-center gap-1 text-[11px]"
                    style={{ color: auth ? "#f59e0b" : "#22c55e" }}
                  >
                    <Lock size={9} />
                    {auth ? "Auth" : "Public"}
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

      {/* ── Security section ──────────────────────────────────────────────── */}
      <section id="security" className="border-t px-6 py-20 md:px-10" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex">
                <Pill accent="#22c55e">
                  <Shield size={10} />
                  Security
                </Pill>
              </div>
              <h2
                className="mb-5 font-display text-3xl font-black md:text-4xl"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
              >
                Security isn't
                <br />
                an afterthought.
              </h2>
              <p className="mb-8 text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                Every security decision in AuthFlow is deliberate. From cookie flags to S3 bucket policies, the threat model is considered at every layer.
              </p>
              <div className="space-y-3">
                {[
                  { label: "passwordHash", color: "#ef4444" },
                  { label: "avatarKey (S3 internal key)", color: "#ef4444" },
                  { label: "privateMetadata", color: "#ef4444" },
                ].map(({ label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3"
                    style={{
                      borderColor: "rgba(239,68,68,0.15)",
                      background: "rgba(239,68,68,0.04)",
                    }}
                  >
                    <EyeOff size={13} style={{ color }} />
                    <code className="font-mono text-xs font-semibold" style={{ color }}>
                      {label}
                    </code>
                    <span className="ml-auto text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                      never returned
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  icon: Cookie,
                  title: "httpOnly flag on all cookies",
                  body: "JavaScript cannot read auth tokens. XSS is neutralized at the storage layer.",
                  accent: "#38bdf8",
                },
                {
                  icon: Key,
                  title: "bcrypt · 10 salt rounds",
                  body: "Passwords are never stored plain or reversibly hashed. bcrypt is slow by design — brute force is prohibitive.",
                  accent: "#a78bfa",
                },
                {
                  icon: RefreshCw,
                  title: "Single-use refresh tokens",
                  body: "Reuse detection is built-in. If a revoked token is used again, the server returns 401 immediately.",
                  accent: "#22c55e",
                },
                {
                  icon: Eye,
                  title: "Avatar key uses select:false",
                  body: "The S3 object key is excluded from all Mongoose queries by default — it can't accidentally leak into any response.",
                  accent: "#f59e0b",
                },
              ].map(({ icon: Icon, title, body, accent }) => (
                <div
                  key={title}
                  className="flex gap-4 rounded-xl border p-4"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)`,
                    }}
                  >
                    <Icon size={16} style={{ color: accent }} />
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

      {/* ── Code preview tabs ─────────────────────────────────────────────── */}
      <section
        className="border-t px-6 py-20 md:px-10"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex justify-center">
            <Pill accent="#a78bfa">
              <GitBranch size={10} />
              Integration
            </Pill>
          </div>
          <h2
            className="mb-4 font-display text-3xl font-black md:text-4xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Integrate in minutes
          </h2>
          <p className="mb-10 text-base" style={{ color: "var(--color-text-secondary)" }}>
            One setting. Every request. Cookies handled automatically.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left md:grid-cols-2">
            <CodeBlock
              title="fetch (native)"
              language="javascript"
              code={`// One-liner for every request
const res = await fetch(url, {
  credentials: 'include', // ← this is it
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});`}
            />
            <CodeBlock
              title="axios"
              language="javascript"
              code={`// Set globally once
axios.defaults.withCredentials = true;

// Then every request just works
const { data } = await axios.post(
  \`/api/v1/project/\${projectId}/end-user/login\`,
  { email, password }
);`}
            />
          </div>
          <div className="mt-4 text-center">
            <Callout text="CORS_ORIGIN must exactly match your frontend origin — wildcard '*' does not work with credentials." />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t px-6 py-24 md:px-10" style={{ borderColor: "var(--color-border)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-x-0 top-0 mx-auto h-px max-w-md"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
            }}
          />
          <div
            className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full opacity-[0.07] blur-[80px]"
            style={{ background: "var(--color-accent)" }}
          />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <h2
            className="mb-5 font-display text-4xl font-black tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          >
            Ready to ship?
          </h2>
          <p className="mb-8 text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            AuthFlow handles the boring parts. You ship the product.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/signup"
              className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-white transition-all hover:opacity-90 hover:shadow-[0_0_40px_rgba(108,99,255,0.35)]"
              style={{ background: "var(--color-accent)" }}
            >
              Get started for free
              <ArrowRight size={16} />
            </a>
            <a
              href="/docs"
              className="flex items-center gap-2 rounded-xl border px-8 py-3.5 text-base font-bold transition-all hover:bg-white/5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              <Terminal size={15} />
              Read the API docs
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer
        className="border-t px-6 py-8"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs md:flex-row"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--color-accent)" }}
            >
              <Shield size={11} className="text-white" />
            </div>
            <span
              className="font-display font-black text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              AuthFlow
            </span>
            <span className="opacity-30">·</span>
            <span>End-User API v1.0</span>
          </div>
          <div className="flex items-center gap-6">
            {["Docs", "Security", "Privacy", "GitHub"].map((l) => (
              <a
                key={l}
                href="#"
                className="transition-colors hover:text-white"
                style={{ color: "var(--color-text-muted)" }}
              >
                {l}
              </a>
            ))}
          </div>
          <span>Express · TypeScript · MongoDB · AWS S3</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Inline callout (used in Integration section) ─────────────────────────────
function Callout({ text }: { text: string }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4 text-left"
      style={{
        background: "rgba(245,158,11,0.06)",
        borderColor: "rgba(245,158,11,0.15)",
      }}
    >
      <Activity size={14} className="mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        <strong style={{ color: "#f59e0b" }}>CORS note: </strong>
        {text}
      </p>
    </div>
  );
}

export default Home;