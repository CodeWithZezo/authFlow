// ==================== src/pages/Home.tsx ====================
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  Layers, Shield, Building2, FolderKanban, Users,
  KeyRound, MonitorSmartphone, Zap, Lock, ArrowRight,
  Check, Code2, Terminal, ChevronRight,
  Globe, Database, Server, GitBranch, Star,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Particle canvas background ───────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const particles: P[] = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.4,
      a: Math.random() * 0.3 + 0.05,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 99, 255, ${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.55 }}
    />
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / 1400, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setCount(Math.floor(ease * target));
            if (t < 1) requestAnimationFrame(tick);
            else setCount(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        background: scrolled ? "rgba(9,9,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 20px rgba(108,99,255,0.45)" }}
          >
            <Layers size={17} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Nexus
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-0.5">
          {[["Docs", "/docs"], ["Features", "#features"], ["Architecture", "#architecture"], ["Compare", "#compare"]].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-medium transition-colors hover:text-white px-4 py-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 22px rgba(108,99,255,0.35)" }}
          >
            Get started
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── Code token helpers ───────────────────────────────────────────────────────
const T = {
  kw: (s: string) => <span style={{ color: "#c084fc" }}>{s}</span>,
  str: (s: string) => <span style={{ color: "#86efac" }}>{s}</span>,
  fn: (s: string) => <span style={{ color: "#60a5fa" }}>{s}</span>,
  op: (s: string) => <span style={{ color: "#8888aa" }}>{s}</span>,
  cm: (s: string) => <span style={{ color: "#44445a" }}>{s}</span>,
  var: (s: string) => <span style={{ color: "#f2f2ff" }}>{s}</span>,
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <ParticleCanvas />

      {/* Gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 60%)" }} />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -left-48 h-[450px] w-[450px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(108,99,255,0.10) 0%, transparent 60%)" }} />
      <div aria-hidden className="pointer-events-none absolute top-1/4 -right-48 h-[500px] w-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 60%)" }} />

      {/* Dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(108,99,255,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">

        {/* Pill badge */}
        <div
          className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-xs font-semibold mb-9 animate-slide-up"
          style={{ borderColor: "rgba(108,99,255,0.28)", background: "rgba(108,99,255,0.07)", color: "var(--color-accent)", animationFillMode: "both" }}
        >
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--color-accent)" }} />
          Open-source · Self-hosted · MIT licensed
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold tracking-tight mb-6 animate-slide-up"
          style={{
            fontSize: "clamp(2.6rem, 6.5vw, 5.2rem)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            animationDelay: "80ms",
            animationFillMode: "both",
          }}
        >
          <span style={{ color: "var(--color-text-primary)" }}>Authentication</span>
          <br />
          <span style={{
            background: "linear-gradient(135deg, #6c63ff 0%, #38bdf8 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            you actually own.
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="mx-auto max-w-2xl text-lg leading-relaxed mb-10 animate-slide-up"
          style={{ color: "var(--color-text-secondary)", animationDelay: "160ms", animationFillMode: "both" }}
        >
          Everything Clerk or Auth0 gives you — organizations, multi-tenant projects, JWT
          rotation, RBAC, S3 avatars — except your data never leaves your servers.
          No per-seat pricing. No vendor lock-in.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
          style={{ animationDelay: "240ms", animationFillMode: "both" }}
        >
          <Link
            to="/signup"
            className="group flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(108,99,255,0.45)] active:scale-[0.98]"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 26px rgba(108,99,255,0.32)" }}
          >
            Start for free
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/docs"
            className="flex items-center gap-2.5 rounded-xl border px-8 py-3.5 text-base font-medium transition-all duration-200 hover:bg-white/5"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
          >
            <Code2 size={16} />
            Read the docs
          </Link>
        </div>

        <p
          className="mt-7 text-xs animate-fade-in"
          style={{ color: "var(--color-text-muted)", animationDelay: "420ms", animationFillMode: "both" }}
        >
          Deploy to any Node.js host · MongoDB + JWT · AWS S3 for avatars
        </p>
      </div>

      {/* Terminal preview */}
      <div
        className="relative z-10 mx-auto mt-16 w-full max-w-3xl px-6 animate-slide-up"
        style={{ animationDelay: "340ms", animationFillMode: "both" }}
      >
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
            boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 70px rgba(108,99,255,0.07)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 border-b px-5 py-3.5"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <span className="h-3 w-3 rounded-full bg-red-500/75" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/75" />
            <span className="h-3 w-3 rounded-full bg-green-500/75" />
            <div className="ml-3 flex items-center gap-1.5 rounded-lg border px-3 py-1"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)" }}>
              <Terminal size={11} style={{ color: "var(--color-text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Quick setup</span>
            </div>
          </div>

          {/* Code */}
          <div className="overflow-x-auto p-7">
            <pre className="text-sm leading-8" style={{ fontFamily: "var(--font-mono)" }}>
              <div>{T.cm("// 1. Create your organization")}</div>
              <div>
                {T.kw("const")} {T.var("org")} {T.op("=")} {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(")}
                {T.str("'/api/v1/organizations'")}
                {T.op(",")} {T.op("{ method: 'POST', body: JSON.stringify({ name: 'Acme', slug: 'acme' }) }")}
                {T.op(")")}
              </div>
              <br />
              <div>{T.cm("// 2. Create a project inside it")}</div>
              <div>
                {T.kw("const")} {T.var("project")} {T.op("=")} {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(`/api/v1/organizations/${")}
                {T.var("org")}
                {T.op(".id}/projects`,")} {T.op("{ method: 'POST' })")}
              </div>
              <br />
              <div>{T.cm("// 3. Set a password policy, then a project policy")}</div>
              <div>
                {T.kw("await")} {T.fn("apiFetch")}
                {T.op("(`/api/v1/projects/${")}
                {T.var("project")}
                {T.op(".id}/password-policy`,")} {T.op("{ method: 'POST' })")}
              </div>
              <br />
              <div>{T.cm("// 4. End-user endpoints are now live  🎉")}</div>
              <div>
                {T.kw("await")} {T.fn("fetch")}
                {T.op("(`/api/v1/project/${")}
                {T.var("project")}
                {T.op(".id}/end-user/signup`,")} {T.op("{ credentials: 'include' })")}
              </div>
            </pre>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div
          className="flex h-8 w-5 items-start justify-center rounded-full border p-1"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            className="h-2 w-0.5 rounded-full animate-bounce"
            style={{ background: "var(--color-text-muted)" }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { label: "API endpoints",    value: 40,  suffix: "+" },
    { label: "Single-use refresh",  value: 100, suffix: "%" },
    { label: "Distinct user systems", value: 2, suffix: "" },
    { label: "Open source forever",  value: 100, suffix: "%" },
  ];

  return (
    <section
      className="border-y"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <p className="font-display text-4xl font-bold tabular-nums" style={{ color: "var(--color-accent)" }}>
                <Counter target={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Building2,       title: "Organizations",         desc: "Top-level multi-tenant workspaces. Owner → Admin → Member hierarchy built in. Unique slug per org.",                                              accent: "#6c63ff", tag: "Multi-tenant" },
  { icon: FolderKanban,    title: "Project Scoping",        desc: "Projects live inside orgs and control end-user authentication. Each gets its own policies, members, and independent configuration.",              accent: "#22c55e", tag: "RBAC" },
  { icon: Shield,          title: "Auth Policies",          desc: "Per-project rules: auth type (password/OAuth/2FA), allowed methods, phone requirements, custom end-user roles and statuses.",                    accent: "#38bdf8", tag: "Configurable" },
  { icon: KeyRound,        title: "JWT Rotation",           desc: "15-minute access tokens + 7-day refresh tokens in httpOnly cookies. Every refresh is single-use — stolen replay tokens just won't work.",      accent: "#f59e0b", tag: "Secure" },
  { icon: MonitorSmartphone, title: "Session Control",      desc: "Real-time session visibility. Revoke one device or force-logout everywhere. Each session is persisted in MongoDB for auditability.",            accent: "#ec4899", tag: "Revocable" },
  { icon: Users,           title: "Dual User Systems",      desc: "Internal users (your dev team) and end-users (your customers) are completely separate — independent auth flows, stores, and endpoints.",        accent: "#a78bfa", tag: "Isolated" },
  { icon: Globe,           title: "Avatar Pipeline",        desc: "multer → sharp (400×400 JPEG, EXIF stripped) → S3. Raw S3 URLs are never exposed. Served through a secure cookie-authenticated stream.",       accent: "#34d399", tag: "S3-backed" },
  { icon: Lock,            title: "Password Policies",      desc: "Per-project enforcement at signup: min length, require uppercase, numbers, special characters. Validated server-side every time.",               accent: "#fb923c", tag: "Enforced" },
  { icon: Zap,             title: "Zero Token Handling",    desc: "Your frontend never reads or stores tokens. The browser cookie jar handles everything. Just set credentials: 'include' on every request.",      accent: "#facc15", tag: "Cookie-first" },
];

function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  const Icon = feature.icon;
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-default"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
        (e.currentTarget as HTMLElement).style.borderColor = `${feature.accent}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Hover ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% -20%, ${feature.accent}0c 0%, transparent 60%)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${feature.accent}18` }}
        >
          <Icon size={19} style={{ color: feature.accent }} />
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
          style={{ background: `${feature.accent}12`, color: feature.accent }}
        >
          {feature.tag}
        </span>
      </div>

      <h3 className="font-display text-sm font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {feature.desc}
      </p>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-accent)" }}>
            Feature set
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Everything you'd expect.
            <br />Nothing you'd regret.
          </h2>
          <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
            Built for teams who need complete control over their auth stack — without per-seat fees or black-box vendor APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => <FeatureCard key={f.title} feature={f} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Architecture ─────────────────────────────────────────────────────────────
function Architecture() {
  const steps = [
    { step: "01", icon: Building2,   title: "Create an Organization", desc: "Your top-level workspace. Pick a unique slug. You automatically become the owner.", accent: "#6c63ff" },
    { step: "02", icon: FolderKanban, title: "Add a Project",          desc: "Projects live inside orgs. This is the scope for all end-user authentication.", accent: "#38bdf8" },
    { step: "03", icon: Lock,         title: "Define Policies",        desc: "Password Policy first, then Project Policy. Set auth methods, roles, statuses.", accent: "#f59e0b" },
    { step: "04", icon: Users,        title: "Users go live",          desc: "Your customers can now register and log in through the project-scoped API.", accent: "#22c55e" },
  ];

  const flow = [
    { label: "Client",          icon: Globe },
    { label: "Express",         icon: Server },
    { label: "authenticate()",  icon: Lock },
    { label: "roleAuthorize()", icon: Shield },
    { label: "Controller",      icon: Code2 },
    { label: "Service",         icon: GitBranch },
    { label: "MongoDB",         icon: Database },
  ];

  return (
    <section
      id="architecture"
      className="py-32"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-accent)" }}>
            How it works
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Up and running in four steps
          </h2>
          <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
            From zero to a fully working multi-tenant auth system. No magic, no surprises.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-14">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div
                    className="absolute top-9 left-[calc(100%-8px)] hidden lg:block h-px z-0"
                    style={{ width: "calc(100% - 16px)", background: `linear-gradient(90deg, ${s.accent}50, ${steps[i + 1].accent}20)` }}
                  />
                )}
                <div
                  className="relative z-10 rounded-2xl border p-6 h-full"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0"
                      style={{ background: `${s.accent}18`, border: `1px solid ${s.accent}28` }}
                    >
                      <Icon size={19} style={{ color: s.accent }} />
                    </div>
                    <span className="font-display text-xs font-bold tracking-widest" style={{ color: s.accent }}>{s.step}</span>
                  </div>
                  <h3 className="font-display text-sm font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Request flow */}
        <div>
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--color-text-muted)" }}>
            Request pipeline
          </p>
          <div
            className="rounded-2xl border p-6 overflow-x-auto"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-3)" }}
          >
            <div className="flex items-center gap-1.5 w-fit mx-auto">
              {flow.map((node, i) => {
                const Icon = node.icon;
                return (
                  <div key={node.label} className="flex items-center gap-1.5">
                    <div
                      className="flex flex-col items-center gap-2 rounded-xl border px-4 py-3 min-w-[100px]"
                      style={{ borderColor: "var(--color-border-2)", background: "var(--color-surface-2)" }}
                    >
                      <Icon size={14} style={{ color: "var(--color-accent)" }} />
                      <span className="text-xs font-medium text-center whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
                        {node.label}
                      </span>
                    </div>
                    {i < flow.length - 1 && (
                      <ChevronRight size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tech stack ───────────────────────────────────────────────────────────────
function TechStack() {
  const tech = [
    { name: "Node.js 18+",   color: "#68a063" },
    { name: "TypeScript",    color: "#3178c6" },
    { name: "Express.js",    color: "#f2f2ff" },
    { name: "MongoDB",       color: "#22c55e" },
    { name: "JWT",           color: "#f59e0b" },
    { name: "AWS S3",        color: "#ff9900" },
    { name: "bcrypt",        color: "#ec4899" },
    { name: "sharp",         color: "#66cc00" },
    { name: "React",         color: "#38bdf8" },
    { name: "Tailwind v4",   color: "#38bdf8" },
    { name: "Zustand",       color: "#f97316" },
    { name: "Helmet + CORS", color: "#a78bfa" },
  ];

  return (
    <section
      className="py-16 border-y"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest mb-8" style={{ color: "var(--color-text-muted)" }}>
          Proven open-source technology
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {tech.map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-2 rounded-full border px-4 py-1.5 transition-colors"
              style={{ borderColor: `${t.color}20`, background: `${t.color}08` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{t.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { feature: "Self-hosted",               nexus: true,  clerk: false, auth0: false },
  { feature: "No per-seat pricing",       nexus: true,  clerk: false, auth0: false },
  { feature: "Data on your servers",      nexus: true,  clerk: false, auth0: false },
  { feature: "JWT rotation",              nexus: true,  clerk: true,  auth0: true  },
  { feature: "Organizations",             nexus: true,  clerk: true,  auth0: true  },
  { feature: "Custom password policies",  nexus: true,  clerk: false, auth0: true  },
  { feature: "Project-scoped auth",       nexus: true,  clerk: false, auth0: false },
  { feature: "Avatar pipeline",           nexus: true,  clerk: true,  auth0: false },
  { feature: "Session revocation",        nexus: true,  clerk: true,  auth0: true  },
  { feature: "Open source",              nexus: true,  clerk: false, auth0: false },
];

function Comparison() {
  return (
    <section id="compare" className="py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-accent)" }}>
            Comparison
          </p>
          <h2 className="font-display text-4xl font-bold tracking-tight mb-4" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Why self-host?
          </h2>
          <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
            You get the complete feature set — without the ongoing SaaS bill.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          {/* Header */}
          <div
            className="grid grid-cols-4 border-b px-6 py-4"
            style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
          >
            <div />
            {["Nexus", "Clerk", "Auth0"].map((name, i) => (
              <div key={name} className="text-center">
                <span
                  className="font-display text-sm font-bold"
                  style={{ color: i === 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={row.feature}
              className="grid grid-cols-4 px-6 py-3.5 items-center"
              style={{
                borderBottom: i < COMPARE_ROWS.length - 1 ? "1px solid var(--color-border)" : "none",
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
              }}
            >
              <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{row.feature}</span>
              {[row.nexus, row.clerk, row.auth0].map((val, j) => (
                <div key={j} className="flex justify-center">
                  {val
                    ? <Check size={16} style={{ color: j === 0 ? "var(--color-accent)" : "var(--color-success)" }} />
                    : <span className="h-0.5 w-4 rounded-full inline-block" style={{ background: "var(--color-border-2)" }} />
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="py-32" style={{ background: "var(--color-surface)" }}>
      <div className="mx-auto max-w-4xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl border p-16 text-center"
          style={{ borderColor: "rgba(108,99,255,0.22)", background: "var(--color-surface-2)" }}
        >
          {/* Orb */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)" }}
          />
          {/* Dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(108,99,255,0.10) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
            }}
          />

          <div className="relative z-10 space-y-7">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(108,99,255,0.28)", background: "rgba(108,99,255,0.07)", color: "var(--color-accent)" }}
            >
              <Star size={11} />
              Free forever · MIT licensed
            </div>

            <h2 className="font-display text-4xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
              Own your auth stack.
              <br />Own your users' data.
            </h2>

            <p className="mx-auto max-w-lg text-base" style={{ color: "var(--color-text-secondary)" }}>
              No credit card. No vendor agreements. No surprises. Deploy to any
              Node.js host and ship your first authenticated user in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/signup"
                className="group flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(108,99,255,0.45)]"
                style={{ background: "var(--color-accent)", boxShadow: "0 0 28px rgba(108,99,255,0.3)" }}
              >
                Create your account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/docs"
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
              >
                <Code2 size={15} />
                Explore the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t py-12" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--color-accent)" }}>
              <Layers size={15} className="text-white" />
            </div>
            <span className="font-display text-base font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>Nexus</span>
          </div>

          <div className="flex items-center gap-6">
            {[["Docs", "/docs"], ["Sign in", "/login"], ["Sign up", "/signup"]].map(([label, href]) => (
              <Link
                key={label}
                to={href}
                className="text-sm transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            MIT License · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <Architecture />
      <TechStack />
      <Comparison />
      <CTA />
      <Footer />
    </div>
  );
}