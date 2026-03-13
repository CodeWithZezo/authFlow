// ==================== src/routes/_app/Home.tsx ====================
// Public-facing landing / marketing page for AuthCore.
// Uses the existing design system (Syne + DM Sans, #09090f bg, #6c63ff accent).
// No router deps — can be rendered at "/" before auth.

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Shield, Users, FolderKanban, KeyRound,
  Lock, RefreshCw, Layers, ArrowRight,
  ChevronRight, Check, Terminal, Cpu,
  Globe, Zap, GitBranch, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 30);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-dim)] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
      {children}
    </span>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, description, accent, items,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
  items: string[];
}) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-[var(--color-border)]",
      "bg-[var(--color-surface)] p-6 transition-all duration-300",
      "hover:border-[var(--color-border-2)] hover:-translate-y-1",
      "hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
    )}>
      {/* Glow on hover */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ background: accent }}
      />

      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in oklch, ${accent} 12%, transparent)`, border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>

      <h3 className="mb-2 font-display text-lg font-bold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mb-4 text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>

      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <Check size={11} className="flex-shrink-0" style={{ color: accent }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Code snippet ─────────────────────────────────────────────────────────────
function CodeBlock({ lines }: { lines: { text: string; dim?: boolean; accent?: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[#0d0d14] font-mono text-xs">
      {/* Titlebar */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5">
        {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
          <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
        ))}
        <span className="ml-2 text-[10px] text-[var(--color-text-muted)]">authcore-api.sh</span>
      </div>
      <div className="p-5 space-y-1 leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} style={{ color: line.accent ?? (line.dim ? "var(--color-text-muted)" : "var(--color-text-secondary)") }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Endpoint row ─────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  GET:    "#38bdf8",
  POST:   "#22c55e",
  PATCH:  "#f59e0b",
  DELETE: "#ef4444",
};

function EndpointRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border)]">
      <span
        className="w-14 flex-shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-bold uppercase"
        style={{ color: METHOD_COLORS[method] ?? "#fff", background: `color-mix(in oklch, ${METHOD_COLORS[method] ?? "#fff"} 10%, transparent)` }}
      >
        {method}
      </span>
      <code className="flex-1 text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors font-mono">
        {path}
      </code>
      <span className="text-xs text-[var(--color-text-muted)] hidden sm:block">{desc}</span>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, accent }: { value: number; suffix?: string; label: string; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="font-display text-4xl font-black" style={{ color: accent }}>
        <Counter target={value} suffix={suffix} />
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function Home() {
  const [activeTab, setActiveTab] = useState<"signup" | "org" | "policy">("signup");

  const codeSamples = {
    signup: [
      { text: "# Create your account", dim: true },
      { text: "" },
      { text: 'curl -X POST https://api.example.com/api/v1/auth/signup \\', accent: "#f2f2ff" },
      { text: '  -H "Content-Type: application/json" \\', dim: true },
      { text: "  -d '{", dim: true },
      { text: '    "fullName": "Jane Doe",', accent: "#6c63ff" },
      { text: '    "email": "jane@example.com",', accent: "#6c63ff" },
      { text: '    "password": "Secure1@Pass"', accent: "#6c63ff" },
      { text: "  }'", dim: true },
      { text: "" },
      { text: "# Response: 201 Created", dim: true },
      { text: '# { "user": { "id": "...", "email": "jane@example.com" } }', accent: "#22c55e" },
    ],
    org: [
      { text: "# Create an organization", dim: true },
      { text: "" },
      { text: 'curl -X POST .../api/v1/organizations \\', accent: "#f2f2ff" },
      { text: '  --cookie "accessToken=<token>" \\', dim: true },
      { text: "  -d '{", dim: true },
      { text: '    "name": "Acme Corp",', accent: "#6c63ff" },
      { text: '    "slug": "acme-corp"', accent: "#6c63ff" },
      { text: "  }'", dim: true },
      { text: "" },
      { text: "# Then create a project inside it:", dim: true },
      { text: 'curl -X POST .../api/v1/organizations/:orgId/projects \\', accent: "#f59e0b" },
      { text: '  -d \'{ "name": "My App" }\'', accent: "#6c63ff" },
    ],
    policy: [
      { text: "# 1. Create password policy first", dim: true },
      { text: 'curl -X POST .../api/v1/projects/:id/password-policy \\', accent: "#f2f2ff" },
      { text: "  -d '{", dim: true },
      { text: '    "minLength": 8,', accent: "#6c63ff" },
      { text: '    "requireNumbers": true,', accent: "#6c63ff" },
      { text: '    "requireUppercase": true', accent: "#6c63ff" },
      { text: "  }'", dim: true },
      { text: "" },
      { text: "# 2. Then create project policy", dim: true },
      { text: 'curl -X POST .../api/v1/projects/:id/policy \\', accent: "#f59e0b" },
      { text: "  -d '{", dim: true },
      { text: '    "authRequired": true,', accent: "#6c63ff" },
      { text: '    "authMethods": ["email", "google"]', accent: "#6c63ff" },
      { text: "  }'", dim: true },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)]">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">AuthCore</span>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            {["Features", "API", "Docs"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_20px_rgba(108,99,255,0.4)]">
              Get Started
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pt-32">

        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[var(--color-accent)] opacity-[0.06] blur-[120px]" />
          <div className="absolute -left-20 top-40 h-64 w-64 rounded-full bg-violet-600 opacity-[0.04] blur-[80px]" />
          <div className="absolute -right-20 top-60 h-64 w-64 rounded-full bg-indigo-600 opacity-[0.04] blur-[80px]" />
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.015]"
            style={{ backgroundImage: "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 text-xs text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Backend API · v1.0 · Express + MongoDB
          </div>

          <h1 className="mb-6 text-5xl font-black leading-[1.1] tracking-tight md:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
            Auth Infrastructure
            <br />
            <span className="bg-gradient-to-r from-[var(--color-accent)] via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Without the Complexity
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--color-text-secondary)] leading-relaxed">
            A multi-tenant authentication API with organizations, projects, role-based access control,
            JWT sessions, and configurable security policies. Everything you need to manage users — nothing you don't.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-7 py-3.5 font-semibold text-white transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] hover:-translate-y-0.5">
              Start Building
              <ArrowRight size={16} />
            </Link>
            <a href="#api"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-7 py-3.5 font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-2)] hover:text-[var(--color-text-primary)]">
              <Terminal size={15} />
              View API Docs
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative mx-auto mt-20 max-w-3xl grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatCard value={35}  suffix="+"  label="API Endpoints"    accent="var(--color-accent)"  />
          <StatCard value={6}   suffix=""   label="Resource Modules" accent="#38bdf8"               />
          <StatCard value={8}   suffix=""   label="Mongoose Schemas"  accent="#22c55e"               />
          <StatCard value={2}   suffix=" tier" label="Role Hierarchies" accent="#f59e0b"            />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Everything in one backend
            </h2>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              Six tightly integrated modules. Zero third-party auth services required.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Lock}
              title="JWT Authentication"
              accent="#6c63ff"
              description="HTTP-only cookie-based dual token system. Access tokens expire in 15 minutes; refresh tokens persist sessions for 7 days."
              items={["Signup & Login", "Token refresh flow", "bcrypt password hashing", "Change password"]}
            />
            <FeatureCard
              icon={Users}
              title="Organizations"
              accent="#38bdf8"
              description="Top-level multi-tenant containers. Users can own, admin, or be members of many organizations simultaneously."
              items={["Create & manage orgs", "Unique slug routing", "Owner / Admin / Member roles", "Cascade member management"]}
            />
            <FeatureCard
              icon={FolderKanban}
              title="Projects"
              accent="#22c55e"
              description="Projects live inside organizations. Each project is an isolated workspace with its own members, roles, and policies."
              items={["Nested under orgs", "Status lifecycle management", "Manager / Contributor / Viewer", "Independent from org roles"]}
            />
            <FeatureCard
              icon={Shield}
              title="Project Policy"
              accent="#f59e0b"
              description="Control exactly how end users access each project. Define auth methods, required fields, and permitted roles and statuses."
              items={["Auth required toggle", "Phone number enforcement", "Auth type: password / oauth / 2FA", "Allowed roles & statuses"]}
            />
            <FeatureCard
              icon={KeyRound}
              title="Password Policy"
              accent="#a78bfa"
              description="Per-project password strength requirements enforced during end-user signup and password reset. Must be created before Project Policy."
              items={["Configurable min length (4–32)", "Require numbers toggle", "Require uppercase toggle", "Require special chars toggle"]}
            />
            <FeatureCard
              icon={RefreshCw}
              title="Session Management"
              accent="#f472b6"
              description="Every login creates a tracked session in MongoDB. Users can view all active sessions and revoke any or all of them."
              items={["Refresh token per session", "List all active sessions", "Revoke individual sessions", "Revoke all (global logout)"]}
            />
          </div>
        </div>
      </section>

      {/* ── Architecture ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionLabel>Architecture</SectionLabel>
            <h2 className="mt-4 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Clean, predictable patterns
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Pattern explanation */}
            <div className="space-y-6">
              {[
                {
                  icon: GitBranch,
                  title: "Controller → Service",
                  desc: "Every module has a controller (HTTP layer) and a service (business logic). Controllers parse requests, services return IServiceResponse<T>.",
                  accent: "#6c63ff",
                },
                {
                  icon: Layers,
                  title: "Middleware chain",
                  desc: "cookieParser → authenticate() → roleAuthorize(role, type). Each layer adds context: cookies, req.user, membership verification.",
                  accent: "#38bdf8",
                },
                {
                  icon: Cpu,
                  title: "Role hierarchy",
                  desc: "roleAuthorize('member') grants access to members AND admins AND owners. Specifying the minimum required role covers all higher roles automatically.",
                  accent: "#22c55e",
                },
                {
                  icon: Globe,
                  title: "Nested routing",
                  desc: "Projects are mounted under organizations (/organizations/:orgId/projects). Router uses mergeParams: true to bubble :orgId up to project handlers.",
                  accent: "#f59e0b",
                },
              ].map(({ icon: Icon, title, desc, accent }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
                    style={{ background: `color-mix(in oklch, ${accent} 12%, transparent)`, border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)` }}>
                    <Icon size={18} style={{ color: accent }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-[var(--color-text-primary)]">{title}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Data flow diagram */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 font-mono text-xs space-y-1">
              <p className="text-[var(--color-text-muted)] mb-4">// Request lifecycle</p>
              {[
                ["Client Request", "#f2f2ff"],
                ["  │", "#44445a"],
                ["  ▼", "#44445a"],
                ["Express Router", "#38bdf8"],
                ["  │  cookieParser()", "#6c63ff"],
                ["  │  authenticate()     → req.user", "#6c63ff"],
                ["  │  roleAuthorize()    → 403 or pass", "#6c63ff"],
                ["  ▼", "#44445a"],
                ["Controller.method(req, res)", "#f59e0b"],
                ["  │  destructure body/params", "#44445a"],
                ["  │  call service.method()", "#44445a"],
                ["  ▼", "#44445a"],
                ["Service.method()", "#22c55e"],
                ["  │  validate inputs", "#44445a"],
                ["  │  query MongoDB", "#44445a"],
                ["  │  return { status, body }", "#44445a"],
                ["  ▼", "#44445a"],
                ["res.status(status).json(body)", "#a78bfa"],
              ].map(([text, color], i) => (
                <div key={i} style={{ color }}>{text as string}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── API Overview ────────────────────────────────────────────────────── */}
      <section id="api" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <SectionLabel>API Reference</SectionLabel>
            <h2 className="mt-4 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              35+ endpoints across 6 modules
            </h2>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              Base URL: <code className="rounded bg-[var(--color-surface-2)] px-2 py-0.5 text-[var(--color-accent)] font-mono text-sm">/api/v1</code>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Auth */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                <Lock size={14} className="text-[var(--color-accent)]" />
                <span className="text-sm font-semibold">Authentication</span>
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">/auth</span>
              </div>
              <div className="p-2 space-y-0.5">
                <EndpointRow method="POST"  path="/auth/signup"          desc="Register user"        />
                <EndpointRow method="POST"  path="/auth/login"           desc="Login + set cookies"  />
                <EndpointRow method="GET"   path="/auth/me"              desc="Current user"         />
                <EndpointRow method="POST"  path="/auth/refresh-token"   desc="Renew access token"   />
                <EndpointRow method="PATCH" path="/auth/change-password" desc="Update password"      />
                <EndpointRow method="POST"  path="/auth/logout"          desc="Clear session"        />
              </div>
            </div>

            {/* Organizations */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                <Users size={14} className="text-[#38bdf8]" />
                <span className="text-sm font-semibold">Organizations</span>
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">/organizations</span>
              </div>
              <div className="p-2 space-y-0.5">
                <EndpointRow method="POST"   path="/organizations"                      desc="Create org"         />
                <EndpointRow method="GET"    path="/organizations/:orgId"               desc="Get org"            />
                <EndpointRow method="PATCH"  path="/organizations/:orgId"               desc="Update org"         />
                <EndpointRow method="DELETE" path="/organizations/:orgId"               desc="Delete org"         />
                <EndpointRow method="GET"    path="/organizations/:orgId/members"       desc="List members"       />
                <EndpointRow method="POST"   path="/organizations/:orgId/members"       desc="Add member"         />
                <EndpointRow method="PATCH"  path="/organizations/:orgId/members/:uid"  desc="Update member"      />
                <EndpointRow method="DELETE" path="/organizations/:orgId/members/:uid"  desc="Remove member"      />
              </div>
            </div>

            {/* Projects */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                <FolderKanban size={14} className="text-[#22c55e]" />
                <span className="text-sm font-semibold">Projects + Members</span>
                <span className="ml-auto text-xs text-[var(--color-text-muted)]">/organizations/:orgId/projects</span>
              </div>
              <div className="p-2 space-y-0.5">
                <EndpointRow method="POST"   path="/"                    desc="Create project"     />
                <EndpointRow method="GET"    path="/"                    desc="List projects"      />
                <EndpointRow method="GET"    path="/:projectId"          desc="Get project"        />
                <EndpointRow method="PATCH"  path="/:projectId"          desc="Update project"     />
                <EndpointRow method="DELETE" path="/:projectId"          desc="Delete project"     />
                <EndpointRow method="POST"   path="/:projectId/members"  desc="Add member"         />
                <EndpointRow method="GET"    path="/:projectId/members"  desc="List members"       />
                <EndpointRow method="PATCH"  path="/:projectId/members/:uid" desc="Update member"  />
                <EndpointRow method="DELETE" path="/:projectId/members/:uid" desc="Remove member"  />
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                  <Shield size={14} className="text-[#f59e0b]" />
                  <span className="text-sm font-semibold">Project Policy</span>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">/projects/:projectId/policy</span>
                </div>
                <div className="p-2 space-y-0.5">
                  <EndpointRow method="POST"   path="/" desc="Create policy"  />
                  <EndpointRow method="GET"    path="/" desc="Get policy"     />
                  <EndpointRow method="PATCH"  path="/" desc="Update policy"  />
                  <EndpointRow method="DELETE" path="/" desc="Delete policy"  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                  <KeyRound size={14} className="text-[#a78bfa]" />
                  <span className="text-sm font-semibold">Password Policy</span>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">/projects/:projectId/password-policy</span>
                </div>
                <div className="p-2 space-y-0.5">
                  <EndpointRow method="POST"   path="/" desc="Create policy"  />
                  <EndpointRow method="GET"    path="/" desc="Get policy"     />
                  <EndpointRow method="PATCH"  path="/" desc="Update policy"  />
                  <EndpointRow method="DELETE" path="/" desc="Delete policy"  />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
                  <RefreshCw size={14} className="text-[#f472b6]" />
                  <span className="text-sm font-semibold">Sessions</span>
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">/sessions</span>
                </div>
                <div className="p-2 space-y-0.5">
                  <EndpointRow method="GET"    path="/"            desc="List sessions"     />
                  <EndpointRow method="DELETE" path="/:sessionId"  desc="Revoke session"    />
                  <EndpointRow method="DELETE" path="/"            desc="Revoke all"        />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Start ────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <SectionLabel>Quick Start</SectionLabel>
            <h2 className="mt-4 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Up and running in minutes
            </h2>
          </div>

          {/* Tab selector */}
          <div className="mb-6 flex gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-1 w-fit mx-auto">
            {(["signup", "org", "policy"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all",
                  activeTab === tab
                    ? "bg-[var(--color-accent)] text-white shadow"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                )}>
                {tab === "signup" ? "1. Sign Up" : tab === "org" ? "2. Create Org" : "3. Set Policy"}
              </button>
            ))}
          </div>

          <div className="mx-auto max-w-2xl">
            <CodeBlock lines={codeSamples[activeTab]} />
          </div>

          {/* Creation order reminder */}
          <div className="mt-10 mx-auto max-w-2xl rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-dim)] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
              Required creation order
            </p>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              {["User", "Organization", "Project", "Password Policy", "Project Policy"].map((item, i, arr) => (
                <>
                  <span key={item} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                    {item}
                  </span>
                  {i < arr.length - 1 && <ChevronRight key={`arrow-${i}`} size={14} className="text-[var(--color-text-muted)]" />}
                </>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Password Policy must exist before Project Policy. Delete in reverse order.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[var(--color-accent)] opacity-[0.07] blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent)] shadow-[0_0_40px_rgba(108,99,255,0.5)]">
              <Zap size={28} className="text-white" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Ready to build?
          </h2>
          <p className="mb-8 text-[var(--color-text-secondary)] leading-relaxed">
            Create your account, set up an organization, and start integrating AuthCore into your project today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup"
              className="flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-8 py-4 font-bold text-white transition-all hover:bg-[var(--color-accent-hover)] hover:shadow-[0_0_30px_rgba(108,99,255,0.5)] hover:-translate-y-0.5">
              Create Account
              <ArrowRight size={16} />
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 font-semibold text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-2)] hover:text-[var(--color-text-primary)]">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-border)] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[var(--color-text-muted)] md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--color-accent)]">
              <Shield size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-[var(--color-text-secondary)]">AuthCore</span>
            <span className="opacity-50">·</span>
            <span>Multi-tenant Auth API</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Express · TypeScript · MongoDB</span>
            <span className="opacity-50">·</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
