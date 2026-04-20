// ==================== src/routes/_app/EndUserApiDocs.tsx ====================
// Full documentation page for the End-User API.
// Renders the enduser-api-docs.json content using the AuthCore design system.
// Matches: Syne + DM Sans, #09090f bg, #6c63ff accent, same component patterns as Home.tsx

import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  User,
  LogOut,
  ChevronRight,
  Check,
  Copy,
  CheckCheck,
  AlertTriangle,
  Info,
  KeyRound,
  Layers,
  ArrowRight,
  Cookie,
  RefreshCw,
  Upload,
  Trash2,
  Eye,
  UserPlus,
  LogIn,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

// ─── Constants ────────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<HttpMethod, { text: string; bg: string }> = {
  GET: { text: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
  POST: { text: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  PATCH: { text: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  DELETE: { text: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const STATUS_COLORS: Record<
  string,
  { text: string; bg: string; border: string }
> = {
  "200": {
    text: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  "201": {
    text: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  "400": {
    text: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
  },
  "401": {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  "404": {
    text: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
  },
  "500": {
    text: "#9ca3af",
    bg: "rgba(156,163,175,0.08)",
    border: "rgba(156,163,175,0.2)",
  },
};

// ─── Nav sections ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "prerequisites", label: "Prerequisites", icon: Layers },
  { id: "authentication", label: "Authentication", icon: Cookie },
  { id: "signup", label: "POST /signup", icon: UserPlus },
  { id: "login", label: "POST /login", icon: LogIn },
  { id: "logout", label: "GET /logout", icon: LogOut },
  { id: "get_profile", label: "GET /profile", icon: User },
  { id: "update_profile", label: "PATCH /profile", icon: Settings },
  { id: "upload_avatar", label: "PATCH /avatar", icon: Upload },
  { id: "delete_avatar", label: "DELETE /avatar", icon: Trash2 },
  { id: "stream_avatar", label: "GET /avatar/:id", icon: Eye },
  { id: "policies", label: "Policy Reference", icon: Shield },
  { id: "errors", label: "Errors", icon: AlertTriangle },
  { id: "examples", label: "Code Examples", icon: ArrowRight },
  { id: "security", label: "Security", icon: Lock },
  { id: "troubleshooting", label: "Troubleshooting", icon: KeyRound },
];

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:bg-white/5"
      style={{ color: copied ? "#22c55e" : "var(--color-text-muted)" }}
    >
      {copied ? <CheckCheck size={11} /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────
function CodeBlock({
  code,
  language = "json",
  title,
}: {
  code: string;
  language?: string;
  title?: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
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
            <div
              key={c}
              className="h-2 w-2 rounded-full"
              style={{ background: c }}
            />
          ))}
          {title && (
            <span
              className="ml-1 font-mono text-[10px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
            }}
          >
            {language}
          </span>
          <CopyButton text={code} />
        </div>
      </div>
      <pre
        className="overflow-x-auto p-4 text-xs leading-relaxed"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#c9d1d9",
          background: "#0a0a12",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Method badge ─────────────────────────────────────────────────────────────
function MethodBadge({ method }: { method: HttpMethod }) {
  const c = METHOD_COLORS[method];
  return (
    <span
      className="flex-shrink-0 rounded px-2 py-0.5 font-mono text-[11px] font-bold uppercase"
      style={{ color: c.text, background: c.bg }}
    >
      {method}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ code }: { code: string }) {
  const key = code.split("_")[0];
  const c = STATUS_COLORS[key] ?? STATUS_COLORS["500"];
  return (
    <span
      className="rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold"
      style={{ color: c.text, background: c.bg, borderColor: c.border }}
    >
      {key}
    </span>
  );
}

// ─── Endpoint header strip ────────────────────────────────────────────────────
function EndpointHeader({
  method,
  path,
  description,
  authRequired,
}: {
  method: HttpMethod;
  path: string;
  description: string;
  authRequired: boolean;
}) {
  const c = METHOD_COLORS[method];
  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="px-5 py-4" style={{ background: `${c.bg}` }}>
        <div className="flex flex-wrap items-center gap-3">
          <MethodBadge method={method} />
          <code
            className="flex-1 font-mono text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            /api/v1/project/:projectId/end-user{path}
          </code>
          <span
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
            style={
              authRequired
                ? {
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.08)",
                    borderColor: "rgba(245,158,11,0.2)",
                  }
                : {
                    color: "#22c55e",
                    background: "rgba(34,197,94,0.08)",
                    borderColor: "rgba(34,197,94,0.2)",
                  }
            }
          >
            <Lock size={9} />
            {authRequired ? "Auth required" : "Public"}
          </span>
        </div>
      </div>
      <div className="px-5 py-3" style={{ background: "var(--color-surface)" }}>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Request field row ────────────────────────────────────────────────────────
function FieldRow({
  name,
  field,
}: {
  name: string;
  field: {
    type: string;
    required: boolean | string;
    description: string;
    enum?: string[];
  };
}) {
  const isRequired =
    field.required === true || typeof field.required === "string";
  return (
    <div
      className="grid grid-cols-1 gap-2 border-b py-3 md:grid-cols-[180px_1fr]"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <code
          className="font-mono text-xs font-semibold"
          style={{ color: "var(--color-accent)" }}
        >
          {name}
        </code>
        <span
          className="font-mono text-[10px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {field.type}
        </span>
        {isRequired ? (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
          >
            {typeof field.required === "string" ? "conditional" : "required"}
          </span>
        ) : (
          <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{
              color: "var(--color-text-muted)",
              background: "var(--color-surface-2)",
            }}
          >
            optional
          </span>
        )}
      </div>
      <div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {field.description}
        </p>
        {typeof field.required === "string" && (
          <p className="mt-1 text-[11px]" style={{ color: "#f59e0b" }}>
            {field.required}
          </p>
        )}
        {field.enum && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {field.enum.map((v) => (
              <code
                key={v}
                className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                style={{
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface-2)",
                }}
              >
                "{v}"
              </code>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  id,
  title,
  icon: Icon,
  accent = "var(--color-accent)",
  children,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklch, ${accent} 12%, transparent)`,
            border: `1px solid color-mix(in oklch, ${accent} 20%, transparent)`,
          }}
        >
          <Icon size={17} style={{ color: accent }} />
        </div>
        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl border p-5", className)}
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Info callout ─────────────────────────────────────────────────────────────
function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      icon: Info,
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.06)",
      border: "rgba(56,189,248,0.15)",
    },
    warning: {
      icon: AlertTriangle,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.06)",
      border: "rgba(245,158,11,0.15)",
    },
    success: {
      icon: Check,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.06)",
      border: "rgba(34,197,94,0.15)",
    },
  }[type];
  const Icon = styles.icon;
  return (
    <div
      className="flex gap-3 rounded-xl border p-4"
      style={{ background: styles.bg, borderColor: styles.border }}
    >
      <Icon
        size={15}
        className="mt-0.5 flex-shrink-0"
        style={{ color: styles.color }}
      />
      <div
        className="text-sm leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Response block ───────────────────────────────────────────────────────────
function ResponseBlock({
  statusKey,
  response,
}: {
  statusKey: string;
  response: {
    description: string;
    body?: object;
    headers?: object;
    cookies_set?: string[];
  };
}) {
  return (
    <div
      className="mb-3 overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ background: "var(--color-surface-2)" }}
      >
        <StatusBadge code={statusKey} />
        <span
          className="text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {response.description}
        </span>
      </div>
      {response.cookies_set && (
        <div
          className="flex flex-wrap items-center gap-2 border-t px-4 py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Cookie size={11} style={{ color: "#f59e0b" }} />
          <span
            className="text-[11px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Sets cookies:
          </span>
          {response.cookies_set.map((c) => (
            <code
              key={c}
              className="rounded px-1.5 py-0.5 font-mono text-[10px]"
              style={{ color: "#f59e0b", background: "rgba(245,158,11,0.08)" }}
            >
              {c}
            </code>
          ))}
        </div>
      )}
      {response.headers && (
        <div
          className="border-t px-4 py-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p
            className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            Response Headers
          </p>
          {Object.entries(response.headers).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 py-0.5">
              <code
                className="font-mono text-[11px]"
                style={{ color: "var(--color-accent)" }}
              >
                {k}:
              </code>
              <code
                className="font-mono text-[11px]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {String(v)}
              </code>
            </div>
          ))}
        </div>
      )}
      {response.body && (
        <div
          className="border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <CodeBlock
            code={JSON.stringify(response.body, null, 2)}
            language="json"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Docs() {
  const [activeExample, setActiveExample] = useState("1_signup");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const ids = NAV_SECTIONS.map((s) => s.id);
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-10% 0px -75% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const exampleKeys = [
    "1_signup",
    "2_login",
    "3_display_avatar",
    "4_upload_avatar",
    "5_update_profile",
    "6_logout",
    "7_auto_refresh",
  ] as const;
  const exampleLabels: Record<string, string> = {
    "1_signup": "1. Signup",
    "2_login": "2. Login",
    "3_display_avatar": "3. Show Avatar",
    "4_upload_avatar": "4. Upload Avatar",
    "5_update_profile": "5. Update Profile",
    "6_logout": "6. Logout",
    "7_auto_refresh": "7. Auto Refresh",
  };
  const exampleCode: Record<string, string> = {
    "1_signup": `const projectId = 'YOUR_PROJECT_ID';

const res = await fetch(\`/api/v1/project/\${projectId}/end-user/signup\`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Secure123!',
    authMethod: 'email',
    role: 'user',
    status: 'active'
  })
});

const data = await res.json();
// data.user._id, data.user.email, data.user.role
// Tokens are set in cookies automatically — no manual handling needed.`,
    "2_login": `const res = await fetch(\`/api/v1/project/\${projectId}/end-user/login\`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jane@example.com',
    password: 'Secure123!'
  })
});

const { user } = await res.json();
// user.avatarUrl is the streaming URL — use it directly in <img src>`,
    "3_display_avatar": `function UserAvatar({ user }) {
  if (!user.avatarUrl) {
    return <div className="placeholder">{user.fullName[0]}</div>;
  }
  return (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      width={40}
      height={40}
    />
  );
}`,
    "4_upload_avatar": `async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file); // field name must be exactly 'avatar'

  const res = await fetch(\`/api/v1/project/\${projectId}/end-user/avatar\`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData
    // Do NOT set Content-Type — browser sets it with boundary automatically
  });

  const { avatarUrl } = await res.json();
  return avatarUrl;
}`,
    "5_update_profile": `await fetch(\`/api/v1/project/\${projectId}/end-user/profile\`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'Jane Smith' })
});`,
    "6_logout": `await fetch(\`/api/v1/project/\${projectId}/end-user/logout\`, {
  credentials: 'include'
});
// Redirect to login or clear local UI state`,
    "7_auto_refresh": `async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) {
    const refreshRes = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include'
    });
    if (refreshRes.ok) {
      res = await fetch(url, { ...options, credentials: 'include' });
    } else {
      window.location.href = '/login';
    }
  }

  return res;
}`,
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)", fontFamily: "var(--font-sans)" }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside
        className="sticky top-0 hidden h-screen w-60 flex-shrink-0 overflow-y-auto border-r p-4 lg:flex lg:flex-col"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2.5 px-2 pt-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--color-accent)" }}
          >
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p
              className="font-display text-sm font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              End-User API
            </p>
            <p
              className="text-[10px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              v1.0 Reference
            </p>
          </div>
        </div>

        {/* Base URL */}
        <div
          className="mb-5 rounded-lg border p-3"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface-2)",
          }}
        >
          <p
            className="mb-1 text-[9px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            Base Path
          </p>
          <code
            className="break-all font-mono text-[10px]"
            style={{ color: "var(--color-accent)" }}
          >
            /api/v1/project/:projectId/end-user
          </code>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV_SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => {
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSection(id);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-all duration-150 text-left"
                style={{
                  color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-accent-dim)" : "transparent",
                  borderLeft: isActive
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
                }}
              >
                <Icon
                  size={13}
                  style={{
                    color: isActive ? "var(--color-accent)" : "#6a6a88",
                    flexShrink: 0,
                  }}
                />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden">
        {/* Page hero */}
        <div
          className="relative overflow-hidden border-b px-6 py-12 md:px-10"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute left-0 top-0 h-64 w-64 rounded-full opacity-[0.05] blur-[80px]"
              style={{ background: "var(--color-accent)" }}
            />
          </div>
          <div className="relative">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{
                  color: "var(--color-accent)",
                  background: "var(--color-accent-dim)",
                  borderColor: "rgba(108,99,255,0.2)",
                }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                REST API · v1.0
              </span>
            </div>
            <h1
              className="mb-3 text-4xl font-black tracking-tight md:text-5xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              End-User API
            </h1>
            <p
              className="max-w-2xl text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Complete reference for integrating end-user authentication into
              your project. Every endpoint is scoped to a specific project via
              the{" "}
              <code
                className="rounded px-1.5 py-0.5 font-mono text-sm"
                style={{
                  color: "var(--color-accent)",
                  background: "var(--color-accent-dim)",
                }}
              >
                :projectId
              </code>{" "}
              parameter.
            </p>
            {/* Quick notes */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Cookie,
                  text: "Tokens stored in httpOnly cookies — never in localStorage",
                },
                {
                  icon: Shield,
                  text: "S3 URLs never exposed — avatars streamed through backend",
                },
                {
                  icon: Lock,
                  text: "All auth endpoints require the accessToken cookie",
                },
                {
                  icon: KeyRound,
                  text: "projectId must be a valid 24-char MongoDB ObjectId",
                },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <Icon size={13} style={{ color: "var(--color-accent)" }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-10 md:px-10">
          {/* ── Overview / Tech Stack ──────────────────────────────────────── */}
          <Section id="overview" title="Overview" icon={Info}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Runtime", "Node.js 18+", "#22c55e"],
                ["Language", "TypeScript", "#38bdf8"],
                ["Framework", "Express.js", "#6c63ff"],
                ["Database", "MongoDB (Mongoose)", "#22c55e"],
                ["Auth", "JWT — httpOnly cookies", "#f59e0b"],
                ["Password Hashing", "bcrypt · 10 salt rounds", "#a78bfa"],
                ["File Upload", "multer · 5 MB max · memory", "#38bdf8"],
                [
                  "Image Processing",
                  "sharp · 400×400 JPEG · EXIF stripped",
                  "#f472b6",
                ],
                [
                  "Object Storage",
                  "AWS S3 · private · never URL-exposed",
                  "#f59e0b",
                ],
              ].map(([label, value, accent]) => (
                <div
                  key={label as string}
                  className="flex items-start gap-3 rounded-xl border p-3.5"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <div
                    className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: accent as string }}
                  />
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {label as string}
                    </p>
                    <p
                      className="mt-0.5 text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {value as string}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Prerequisites ────────────────────────────────────────────────── */}
          <Section
            id="prerequisites"
            title="Prerequisites"
            icon={Layers}
            accent="#38bdf8"
          >
            <Callout type="warning">
              Before any end-user can register or log in, an admin must complete
              the following setup through the internal admin API.
            </Callout>
            <div className="mt-5 space-y-3">
              {[
                {
                  step: 1,
                  action: "Create an Organization",
                  endpoint: "POST /api/v1/organizations",
                  note: "The creating user must have isVerified = true.",
                  accent: "#6c63ff",
                },
                {
                  step: 2,
                  action: "Create a Project",
                  endpoint: "POST /api/v1/organizations/:orgId/projects",
                  note: null,
                  accent: "#38bdf8",
                },
                {
                  step: 3,
                  action: "Create a Password Policy",
                  endpoint: "POST /api/v1/projects/:projectId/password-policy",
                  note: "Must exist before a Project Policy can be created.",
                  accent: "#a78bfa",
                },
                {
                  step: 4,
                  action: "Create a Project Policy",
                  endpoint: "POST /api/v1/projects/:projectId/policy",
                  note: "Defines allowed auth methods, roles, statuses, and password rules.",
                  accent: "#f59e0b",
                },
              ].map(({ step, action, endpoint, note, accent }) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-xl border p-4"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-display text-sm font-black"
                    style={{
                      background: `color-mix(in oklch, ${accent} 15%, transparent)`,
                      color: accent,
                    }}
                  >
                    {step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {action}
                    </p>
                    <code
                      className="mt-1 block font-mono text-xs"
                      style={{ color: accent }}
                    >
                      {endpoint}
                    </code>
                    {note && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {note}
                      </p>
                    )}
                  </div>
                  {step < 4 && (
                    <ChevronRight
                      size={14}
                      className="flex-shrink-0 self-center"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ── Authentication ───────────────────────────────────────────────── */}
          <Section
            id="authentication"
            title="Authentication"
            icon={Cookie}
            accent="#f59e0b"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  name: "accessToken",
                  expiry: "15 minutes",
                  desc: "Sent with every authenticated request automatically by the browser.",
                  accent: "#22c55e",
                },
                {
                  name: "refreshToken",
                  expiry: "7 days",
                  desc: "Used to obtain a new access token. Single-use — rotated on every refresh.",
                  accent: "#38bdf8",
                },
              ].map(({ name, expiry, desc, accent }) => (
                <Card key={name}>
                  <div className="mb-3 flex items-center justify-between">
                    <code
                      className="font-mono text-sm font-bold"
                      style={{ color: accent }}
                    >
                      {name}
                    </code>
                    <span
                      className="rounded-full border px-2 py-0.5 font-mono text-[11px]"
                      style={{
                        color: accent,
                        background: `color-mix(in oklch, ${accent} 8%, transparent)`,
                        borderColor: `color-mix(in oklch, ${accent} 20%, transparent)`,
                      }}
                    >
                      {expiry}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {desc}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              <Card>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Frontend Setup
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "fetch",
                      code: "credentials: 'include'",
                      note: "Required on every request.",
                    },
                    {
                      label: "axios",
                      code: "axios.defaults.withCredentials = true",
                      note: "Set globally once.",
                    },
                    {
                      label: "cors",
                      code: "CORS_ORIGIN must exactly match frontend origin",
                      note: "Wildcard '*' does not work with credentials.",
                    },
                  ].map(({ label, code, note }) => (
                    <div
                      key={label}
                      className="flex flex-wrap items-start gap-3 rounded-lg border px-3 py-2.5"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-surface-2)",
                      }}
                    >
                      <span
                        className="w-10 flex-shrink-0 text-[11px] font-bold uppercase"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {label}
                      </span>
                      <code
                        className="flex-1 font-mono text-xs"
                        style={{ color: "var(--color-accent)" }}
                      >
                        {code}
                      </code>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {note}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Section>

          {/* ── Endpoints ────────────────────────────────────────────────────── */}

          {/* POST /signup */}
          <Section id="signup" title="Register End-User" icon={UserPlus}>
            <EndpointHeader
              method="POST"
              path="/signup"
              description="Register a new end-user for a specific project. The request is validated against the project's policy before the user is created."
              authRequired={false}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Request Body
                </p>
                <Card>
                  <div
                    className="divide-y"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {[
                      {
                        name: "fullName",
                        field: {
                          type: "string",
                          required: true,
                          description: "User's full name.",
                        },
                      },
                      {
                        name: "email",
                        field: {
                          type: "string",
                          required: true,
                          description:
                            "Valid email address. Stored in lowercase. Must be unique within the project.",
                        },
                      },
                      {
                        name: "password",
                        field: {
                          type: "string",
                          required: "Required when authType is 'password'",
                          description:
                            "Plain-text password. Must satisfy the project's password policy.",
                        },
                      },
                      {
                        name: "phone",
                        field: {
                          type: "string",
                          required: "Required when phoneRequired is true",
                          description:
                            "Phone number in E.164 format, e.g. +12125551234.",
                        },
                      },
                      {
                        name: "authMethod",
                        field: {
                          type: "string",
                          required: true,
                          description:
                            "Auth method. Must be in the project policy's authMethods list.",
                          enum: ["email", "phone", "google", "github"],
                        },
                      },
                      {
                        name: "role",
                        field: {
                          type: "string",
                          required: false,
                          description:
                            "Role to assign. Must be in policy's roles list if non-empty.",
                        },
                      },
                      {
                        name: "status",
                        field: {
                          type: "string",
                          required: false,
                          description:
                            "Status to assign. Must be in policy's statuses list if non-empty.",
                        },
                      },
                    ].map(({ name, field }) => (
                      <FieldRow key={name} name={name} field={field as any} />
                    ))}
                  </div>
                </Card>

                <div className="mt-4">
                  <p
                    className="mb-3 font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Validation Rules
                  </p>
                  <Card>
                    <ul className="space-y-2">
                      {[
                        "authMethod must be in policy's authMethods array (if non-empty).",
                        "If authType is 'password': password is required.",
                        "If authType is not 'password': password must NOT be provided.",
                        "If phoneRequired is true and authMethod is 'phone': phone is required.",
                        "role must be in policy's roles array (if non-empty).",
                        "status must be in policy's statuses array (if non-empty).",
                        "password must satisfy the project's password policy.",
                        "Suspended users are treated as non-existent.",
                      ].map((rule) => (
                        <li
                          key={rule}
                          className="flex items-start gap-2 text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          <Check
                            size={11}
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: "#22c55e" }}
                          />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>

              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Request Example
                </p>
                <CodeBlock
                  language="json"
                  title="request body"
                  code={`{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure123!",
  "authMethod": "email",
  "role": "user",
  "status": "active"
}`}
                />
                <div className="mt-4">
                  <p
                    className="mb-3 font-semibold text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Responses
                  </p>
                  {(
                    [
                      [
                        "201",
                        {
                          description: "User created. Tokens set in cookies.",
                          cookies_set: [
                            "accessToken (15 min)",
                            "refreshToken (7 days)",
                          ],
                          body: {
                            message: "User created successfully",
                            user: {
                              _id: "664abc123def456789012345",
                              fullName: "Jane Doe",
                              email: "jane@example.com",
                              phone: null,
                              role: "user",
                              status: "active",
                              avatarUrl: null,
                            },
                          },
                        },
                      ],
                      [
                        "400_validation",
                        {
                          description: "Policy validation failed.",
                          body: {
                            message: "Signup validation failed",
                            errors: [
                              "Auth method 'google' is not allowed",
                              "Password must be at least 8 characters long",
                            ],
                          },
                        },
                      ],
                      [
                        "400_duplicate",
                        {
                          description:
                            "Email already registered in this project.",
                          body: {
                            message: "User already exists",
                            errors: ["User already exists"],
                          },
                        },
                      ],
                      [
                        "404",
                        {
                          description:
                            "Project not found or no policy configured.",
                          body: { message: "Project not found" },
                        },
                      ],
                    ] as const
                  ).map(([key, res]) => (
                    <ResponseBlock
                      key={key as string}
                      statusKey={key as string}
                      response={res as any}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* POST /login */}
          <Section id="login" title="Login" icon={LogIn} accent="#22c55e">
            <EndpointHeader
              method="POST"
              path="/login"
              description="Log in an existing end-user. Creates a new session and sets auth cookies."
              authRequired={false}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Request Body
                </p>
                <Card>
                  <FieldRow
                    name="email"
                    field={{
                      type: "string",
                      required: true,
                      description: "The email address used at signup.",
                    }}
                  />
                  <FieldRow
                    name="password"
                    field={{
                      type: "string",
                      required: true,
                      description: "Plain-text password.",
                    }}
                  />
                </Card>
                <div className="mt-4">
                  <Callout type="info">
                    <strong>avatarUrl</strong> in the response is the backend
                    streaming endpoint — never a raw S3 URL. It is{" "}
                    <code>null</code> if the user has not uploaded an avatar
                    yet.
                  </Callout>
                </div>
              </div>
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Responses
                </p>
                {(
                  [
                    [
                      "200",
                      {
                        description: "Login successful. Tokens set in cookies.",
                        cookies_set: [
                          "accessToken (15 min)",
                          "refreshToken (7 days)",
                        ],
                        body: {
                          message: "User logged in successfully",
                          user: {
                            _id: "664abc123def456789012345",
                            fullName: "Jane Doe",
                            email: "jane@example.com",
                            phone: null,
                            role: "user",
                            status: "active",
                            avatarUrl:
                              "/api/v1/project/664xyz.../end-user/avatar/664abc...",
                          },
                        },
                      },
                    ],
                    [
                      "401",
                      {
                        description: "Wrong password.",
                        body: {
                          message: "Invalid password",
                          errors: ["Invalid password"],
                        },
                      },
                    ],
                    [
                      "404",
                      {
                        description: "Email not found or user is suspended.",
                        body: {
                          message: "User not found",
                          errors: ["User not found"],
                        },
                      },
                    ],
                  ] as const
                ).map(([key, res]) => (
                  <ResponseBlock
                    key={key as string}
                    statusKey={key as string}
                    response={res as any}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* GET /logout */}
          <Section id="logout" title="Logout" icon={LogOut} accent="#f472b6">
            <EndpointHeader
              method="GET"
              path="/logout"
              description="Log out the current end-user. Deletes the current session from the database."
              authRequired={true}
            />
            <Callout type="info">
              No request body needed. Authentication is read from the{" "}
              <code>accessToken</code> cookie automatically.
            </Callout>
            <div className="mt-5">
              <p
                className="mb-3 font-semibold text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                Responses
              </p>
              {(
                [
                  [
                    "200",
                    {
                      description: "Logout successful.",
                      body: { message: "User logged out successfully" },
                    },
                  ],
                  [
                    "401",
                    {
                      description: "Not authenticated.",
                      body: { message: "Not authenticated" },
                    },
                  ],
                  [
                    "404",
                    {
                      description:
                        "Session not found (expired or already revoked).",
                      body: {
                        message: "Session not found",
                        errors: ["Session not found"],
                      },
                    },
                  ],
                ] as const
              ).map(([key, res]) => (
                <ResponseBlock
                  key={key as string}
                  statusKey={key as string}
                  response={res as any}
                />
              ))}
            </div>
          </Section>

          {/* GET /profile */}
          <Section
            id="get_profile"
            title="Get Profile"
            icon={User}
            accent="#38bdf8"
          >
            <EndpointHeader
              method="GET"
              path="/profile"
              description="Get the authenticated end-user's full profile, including their role and status within this project."
              authRequired={true}
            />
            <div className="mb-5">
              <Callout type="success">
                <strong>Never returned:</strong> passwordHash · privateMetadata
                · avatarKey (internal S3 key)
              </Callout>
            </div>
            {(
              [
                [
                  "200",
                  {
                    description: "Profile fetched.",
                    body: {
                      message: "Profile fetched successfully",
                      user: {
                        _id: "664abc123def456789012345",
                        fullName: "Jane Doe",
                        email: "jane@example.com",
                        phone: null,
                        isVerified: false,
                        publicMetadata: {},
                        role: "user",
                        status: "active",
                        avatarUrl: null,
                        createdAt: "2024-06-01T10:00:00.000Z",
                        updatedAt: "2024-06-01T10:00:00.000Z",
                      },
                    },
                  },
                ],
                [
                  "401",
                  {
                    description: "Not authenticated.",
                    body: { message: "Not authenticated" },
                  },
                ],
                [
                  "404",
                  {
                    description: "User or end-user record not found.",
                    body: {
                      message: "End-user record not found for this project",
                    },
                  },
                ],
              ] as const
            ).map(([key, res]) => (
              <ResponseBlock
                key={key as string}
                statusKey={key as string}
                response={res as any}
              />
            ))}
          </Section>

          {/* PATCH /profile */}
          <Section
            id="update_profile"
            title="Update Profile"
            icon={Settings}
            accent="#a78bfa"
          >
            <EndpointHeader
              method="PATCH"
              path="/profile"
              description="Update the authenticated end-user's profile. Only fullName and phone can be updated."
              authRequired={true}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Request Body
                </p>
                <Card>
                  <FieldRow
                    name="fullName"
                    field={{
                      type: "string",
                      required: false,
                      description: "New full name. Max 100 characters.",
                    }}
                  />
                  <FieldRow
                    name="phone"
                    field={{
                      type: "string",
                      required: false,
                      description: "New phone number in E.164 format.",
                    }}
                  />
                </Card>
                <p
                  className="mt-2 text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  At least one field must be provided.
                </p>
              </div>
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Responses
                </p>
                {(
                  [
                    [
                      "200",
                      {
                        description: "Profile updated.",
                        body: {
                          message: "Profile updated successfully",
                          user: {
                            _id: "664abc...",
                            fullName: "Jane Smith",
                            email: "jane@example.com",
                            phone: null,
                            avatarUrl: null,
                          },
                        },
                      },
                    ],
                    [
                      "400",
                      {
                        description: "No fields provided.",
                        body: {
                          message: "At least one field is required to update",
                        },
                      },
                    ],
                    [
                      "401",
                      {
                        description: "Not authenticated.",
                        body: { message: "Not authenticated" },
                      },
                    ],
                  ] as const
                ).map(([key, res]) => (
                  <ResponseBlock
                    key={key as string}
                    statusKey={key as string}
                    response={res as any}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* PATCH /avatar */}
          <Section
            id="upload_avatar"
            title="Upload Avatar"
            icon={Upload}
            accent="#22c55e"
          >
            <EndpointHeader
              method="PATCH"
              path="/avatar"
              description="Upload or replace the end-user's avatar. Processed server-side before being stored in S3. The S3 URL is never exposed."
              authRequired={true}
            />

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Max Size", value: "5 MB", accent: "#f59e0b" },
                {
                  label: "Accepted Types",
                  value: "JPEG · PNG · WebP · GIF",
                  accent: "#38bdf8",
                },
                {
                  label: "Output",
                  value: "400×400 JPEG, quality 85",
                  accent: "#22c55e",
                },
                { label: "Field Name", value: "avatar", accent: "#a78bfa" },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3.5"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-1 font-mono text-sm font-semibold"
                    style={{ color: accent }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <Callout type="warning">
              Do <strong>NOT</strong> set the <code>Content-Type</code> header
              manually. The browser sets it with the multipart boundary
              automatically when using <code>FormData</code>.
            </Callout>

            <div className="mt-5">
              <p
                className="mb-3 font-semibold text-sm"
                style={{ color: "var(--color-text-primary)" }}
              >
                Upload Pipeline
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
                {[
                  "multer validates type + size",
                  "sharp resizes 400×400 JPEG",
                  "old S3 object deleted",
                  "buffer uploaded via S3",
                  "key stored in MongoDB",
                  "streaming URL returned",
                ].map((step, i, arr) => (
                  <div key={step} className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
                      style={{
                        borderColor: "var(--color-border)",
                        background: "var(--color-surface)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded-full font-bold text-[10px]"
                        style={{
                          background: "var(--color-accent-dim)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight
                        size={12}
                        style={{ color: "var(--color-text-muted)" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Request Example
                </p>
                <CodeBlock
                  language="javascript"
                  title="upload-avatar.js"
                  code={`const formData = new FormData();
formData.append('avatar', file); // field: 'avatar'

const res = await fetch(
  \`/api/v1/project/\${projectId}/end-user/avatar\`,
  {
    method: 'PATCH',
    credentials: 'include',
    body: formData
    // No Content-Type header!
  }
);
const { avatarUrl } = await res.json();`}
                />
              </div>
              <div>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Responses
                </p>
                {(
                  [
                    [
                      "200",
                      {
                        description: "Avatar uploaded. Returns streaming URL.",
                        body: {
                          message: "Avatar uploaded successfully",
                          avatarUrl:
                            "/api/v1/project/664xyz.../end-user/avatar/664abc...",
                        },
                      },
                    ],
                    [
                      "400_no_file",
                      {
                        description: "No file attached.",
                        body: {
                          message:
                            "No image file provided. Use field name 'avatar'.",
                        },
                      },
                    ],
                    [
                      "400_type",
                      {
                        description: "Unsupported file type.",
                        body: {
                          message:
                            "Unsupported file type. Allowed: image/jpeg, image/png, image/webp, image/gif",
                        },
                      },
                    ],
                    [
                      "400_size",
                      {
                        description: "File exceeds 5 MB.",
                        body: {
                          message: "File too large. Maximum size is 5 MB.",
                        },
                      },
                    ],
                    [
                      "401",
                      {
                        description: "Not authenticated.",
                        body: { message: "Not authenticated" },
                      },
                    ],
                  ] as const
                ).map(([key, res]) => (
                  <ResponseBlock
                    key={key as string}
                    statusKey={key as string}
                    response={res as any}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* DELETE /avatar */}
          <Section
            id="delete_avatar"
            title="Delete Avatar"
            icon={Trash2}
            accent="#ef4444"
          >
            <EndpointHeader
              method="DELETE"
              path="/avatar"
              description="Remove the end-user's avatar. Deletes the object from S3 and clears the field in MongoDB."
              authRequired={true}
            />
            {(
              [
                [
                  "200",
                  {
                    description: "Avatar deleted.",
                    body: { message: "Avatar deleted successfully" },
                  },
                ],
                [
                  "401",
                  {
                    description: "Not authenticated.",
                    body: { message: "Not authenticated" },
                  },
                ],
                [
                  "404",
                  {
                    description: "No avatar to delete.",
                    body: { message: "No avatar to delete" },
                  },
                ],
              ] as const
            ).map(([key, res]) => (
              <ResponseBlock
                key={key as string}
                statusKey={key as string}
                response={res as any}
              />
            ))}
          </Section>

          {/* GET /avatar/:userId */}
          <Section
            id="stream_avatar"
            title="Stream Avatar"
            icon={Eye}
            accent="#38bdf8"
          >
            <EndpointHeader
              method="GET"
              path="/avatar/:userId"
              description="Stream the user's avatar image bytes directly from S3 through the backend. S3 URL is never exposed."
              authRequired={true}
            />

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Callout type="success">
                Use <code>avatarUrl</code> from login or profile responses
                directly in <code>&lt;img src&gt;</code>. The browser sends the
                auth cookie automatically because the URL is same-origin.
              </Callout>
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                <p
                  className="mb-2 text-xs font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  React usage
                </p>
                <CodeBlock
                  language="jsx"
                  title="UserAvatar.jsx"
                  code={`function UserAvatar({ user }) {
  if (!user.avatarUrl)
    return <div>{user.fullName[0]}</div>;
  return (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
    />
  );
}`}
                />
              </div>
            </div>

            {(
              [
                [
                  "200",
                  {
                    description: "Raw JPEG bytes streamed to the client.",
                    headers: {
                      "Content-Type": "image/jpeg",
                      "Cache-Control": "private, max-age=3600",
                      "Content-Length": "12345",
                    },
                  },
                ],
                [
                  "401",
                  {
                    description: "Not authenticated.",
                    body: { message: "Not authenticated" },
                  },
                ],
                [
                  "404_no_avatar",
                  {
                    description: "User has no avatar.",
                    body: { message: "No avatar set for this user" },
                  },
                ],
                [
                  "404_no_user",
                  {
                    description: "User not found.",
                    body: { message: "User not found" },
                  },
                ],
              ] as const
            ).map(([key, res]) => (
              <ResponseBlock
                key={key as string}
                statusKey={key as string}
                response={res as any}
              />
            ))}
          </Section>

          {/* ── Policy Reference ────────────────────────────────────────────── */}
          <Section
            id="policies"
            title="Policy Reference"
            icon={Shield}
            accent="#f59e0b"
          >
            <div className="mb-6">
              <p
                className="mb-4 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The Project Policy controls every aspect of end-user signup.
                Configure it at{" "}
                <code
                  className="font-mono text-xs"
                  style={{ color: "var(--color-accent)" }}
                >
                  POST /api/v1/projects/:projectId/policy
                </code>
                .
              </p>
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div
                  className="border-b px-5 py-3"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Project Policy Fields
                  </p>
                </div>
                <div
                  className="divide-y"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {[
                    {
                      name: "authRequired",
                      type: "boolean",
                      default: "true",
                      effect:
                        "If true, authMethod is required in the signup body.",
                    },
                    {
                      name: "authType",
                      type: "string",
                      default: "password",
                      effect:
                        "If 'password', a password must be provided. If not, password must NOT be sent.",
                      values: ["password", "oauth", "2fa"],
                    },
                    {
                      name: "authMethods",
                      type: "string[]",
                      default: "[]",
                      effect:
                        "If non-empty, signup authMethod must be in this list. Empty = no restriction.",
                      values: ["email", "phone", "google", "github"],
                    },
                    {
                      name: "phoneRequired",
                      type: "boolean",
                      default: "false",
                      effect:
                        "If true and authMethod is 'phone', the phone field is mandatory.",
                    },
                    {
                      name: "roles",
                      type: "string[]",
                      default: "[]",
                      effect:
                        "If non-empty, signup role must be in this list. Empty = any role accepted.",
                    },
                    {
                      name: "statuses",
                      type: "string[]",
                      default: "[]",
                      effect:
                        "If non-empty, signup status must be in this list. Empty = any status accepted.",
                    },
                  ].map(({ name, type, default: def, effect, values }) => (
                    <div
                      key={name}
                      className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[200px_1fr]"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <code
                          className="font-mono text-xs font-bold"
                          style={{ color: "var(--color-accent)" }}
                        >
                          {name}
                        </code>
                        <span
                          className="font-mono text-[10px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {type}
                        </span>
                        <span
                          className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                          style={{
                            color: "#f59e0b",
                            background: "rgba(245,158,11,0.08)",
                          }}
                        >
                          default: {def}
                        </span>
                      </div>
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {effect}
                        </p>
                        {values && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {values.map((v) => (
                              <code
                                key={v}
                                className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                                style={{
                                  color: "var(--color-text-secondary)",
                                  background: "var(--color-surface-2)",
                                }}
                              >
                                "{v}"
                              </code>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p
                className="mb-4 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                The Password Policy controls strength requirements at signup.
                Configure at{" "}
                <code
                  className="font-mono text-xs"
                  style={{ color: "var(--color-accent)" }}
                >
                  POST /api/v1/projects/:projectId/password-policy
                </code>
                .
              </p>
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div
                  className="border-b px-5 py-3"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Password Policy Fields
                  </p>
                </div>
                {[
                  {
                    name: "minLength",
                    type: "number",
                    default: "6",
                    description:
                      "Minimum password character count. Minimum value: 4.",
                  },
                  {
                    name: "requireNumbers",
                    type: "boolean",
                    default: "true",
                    description: "At least one digit (0–9) required.",
                  },
                  {
                    name: "requireUppercase",
                    type: "boolean",
                    default: "true",
                    description:
                      "At least one uppercase letter (A–Z) required.",
                  },
                  {
                    name: "requireSpecialChars",
                    type: "boolean",
                    default: "false",
                    description:
                      'At least one special character required: !@#$%^&*(),.?":{}|<>',
                  },
                ].map(({ name, type, default: def, description }) => (
                  <div
                    key={name}
                    className="grid grid-cols-1 gap-2 border-t px-5 py-3 md:grid-cols-[200px_1fr]"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface)",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <code
                        className="font-mono text-xs font-bold"
                        style={{ color: "#a78bfa" }}
                      >
                        {name}
                      </code>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {type}
                      </span>
                      <span
                        className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                        style={{
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.08)",
                        }}
                      >
                        default: {def}
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin setup example */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Step 1 — Password Policy
                </p>
                <CodeBlock
                  language="json"
                  title="POST /password-policy"
                  code={`{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": false
}`}
                />
              </div>
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Step 2 — Project Policy
                </p>
                <CodeBlock
                  language="json"
                  title="POST /policy"
                  code={`{
  "authType": "password",
  "authMethods": ["email"],
  "authRequired": true,
  "phoneRequired": false,
  "roles": ["user", "admin"],
  "statuses": ["active", "pending"]
}`}
                />
              </div>
            </div>
          </Section>

          {/* ── Error Format ──────────────────────────────────────────────────── */}
          <Section
            id="errors"
            title="Error Responses"
            icon={AlertTriangle}
            accent="#ef4444"
          >
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries({
                "201": "Created",
                "200": "OK",
                "400": "Bad Request",
                "401": "Unauthorized",
                "404": "Not Found",
                "500": "Internal Error",
              }).map(([code, label]) => (
                <div
                  key={code}
                  className="flex items-center gap-3 rounded-xl border p-3.5"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                  }}
                >
                  <StatusBadge code={code} />
                  <span
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Simple error
                </p>
                <CodeBlock
                  language="json"
                  code={`{ "message": "User not found" }`}
                />
              </div>
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Validation errors
                </p>
                <CodeBlock
                  language="json"
                  code={`{
  "message": "Signup validation failed",
  "errors": [
    "Auth method 'google' is not allowed",
    "Password must be at least 8 characters long",
    "Role 'superadmin' is not allowed for this project"
  ]
}`}
                />
              </div>
            </div>
          </Section>

          {/* ── Code Examples ─────────────────────────────────────────────────── */}
          <Section
            id="examples"
            title="Code Examples"
            icon={ArrowRight}
            accent="#6c63ff"
          >
            <div className="mb-4 flex flex-wrap gap-2">
              {exampleKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveExample(key)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-medium transition-all",
                    activeExample === key ? "text-white" : "",
                  )}
                  style={
                    activeExample === key
                      ? { background: "var(--color-accent)", color: "white" }
                      : {
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-secondary)",
                        }
                  }
                >
                  {exampleLabels[key]}
                </button>
              ))}
            </div>
            <CodeBlock
              language="javascript"
              title={`${exampleLabels[activeExample].toLowerCase()}.js`}
              code={exampleCode[activeExample]}
            />
          </Section>

          {/* ── Security ──────────────────────────────────────────────────────── */}
          <Section
            id="security"
            title="Security Design"
            icon={Lock}
            accent="#22c55e"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                {
                  title: "S3 URL never exposed",
                  accent: "#22c55e",
                  icon: Shield,
                  body: "The avatarKey field is stored in MongoDB with select:false — excluded from all queries by default. No controller or service ever returns it. Clients receive only a backend streaming URL. The S3 bucket remains fully private.",
                },
                {
                  title: "httpOnly cookies",
                  accent: "#38bdf8",
                  icon: Cookie,
                  body: "Access and refresh tokens are stored in httpOnly cookies, inaccessible to JavaScript. This eliminates the risk of XSS token theft.",
                },
                {
                  title: "Refresh token rotation",
                  accent: "#f59e0b",
                  icon: RefreshCw,
                  body: "Each refresh token is single-use. Using it immediately invalidates it and creates a new session. Reusing a revoked token returns 401.",
                },
                {
                  title: "Suspended user blocking",
                  accent: "#ef4444",
                  icon: Lock,
                  body: "findUserByEmailInProject filters out users with status = 'suspended'. They are treated as if they do not exist — login returns 404.",
                },
              ].map(({ title, accent, icon: Icon, body }) => (
                <Card key={title}>
                  <div className="mb-3 flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
                      style={{
                        background: `color-mix(in oklch, ${accent} 12%, transparent)`,
                      }}
                    >
                      <Icon size={15} style={{ color: accent }} />
                    </div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {title}
                    </p>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {body}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-4">
              <Card>
                <p
                  className="mb-3 font-semibold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Fields never returned in responses
                </p>
                <div className="flex flex-wrap gap-2">
                  {["passwordHash", "avatarKey", "privateMetadata"].map((f) => (
                    <code
                      key={f}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs"
                      style={{
                        color: "#ef4444",
                        background: "rgba(239,68,68,0.06)",
                        borderColor: "rgba(239,68,68,0.15)",
                      }}
                    >
                      <Lock size={10} />
                      {f}
                    </code>
                  ))}
                </div>
              </Card>
            </div>
          </Section>

          {/* ── Troubleshooting ───────────────────────────────────────────────── */}
          <Section
            id="troubleshooting"
            title="Troubleshooting"
            icon={KeyRound}
            accent="#a78bfa"
          >
            <div className="space-y-3">
              {[
                {
                  error: "Auth method 'X' is not allowed",
                  cause:
                    "The submitted authMethod is not in the project policy's authMethods list.",
                  fix: "Check the project policy's authMethods and use a configured value (e.g. 'email').",
                },
                {
                  error: "Role 'X' is not allowed for this project",
                  cause:
                    "The submitted role is not in the project policy's roles list.",
                  fix: "Use a role from the allowed list, or omit the field if roles are not enforced.",
                },
                {
                  error: "Password is required for password auth",
                  cause: "authType is 'password' but no password was sent.",
                  fix: "Include the password field in the request body.",
                },
                {
                  error: "Password must be at least N characters",
                  cause:
                    "The password does not meet the project's password policy rules.",
                  fix: "Check the errors array for the specific requirement that failed.",
                },
                {
                  error: "User not found",
                  cause:
                    "Email is not registered in this project, or the user is suspended.",
                  fix: "Verify the email and projectId. Suspended users must be re-activated by an admin.",
                },
                {
                  error: "Failed to process image",
                  cause:
                    "The file has a valid MIME type but corrupt or unreadable image data.",
                  fix: "Ensure the file is a real, uncorrupted JPEG, PNG, WebP, or GIF.",
                },
                {
                  error: "Not authenticated",
                  cause:
                    "The accessToken cookie is missing, expired, or invalid.",
                  fix: "Call POST /api/v1/auth/refresh-token. If it fails, redirect to login.",
                },
                {
                  error: "No cookie despite successful login",
                  cause:
                    "credentials: 'include' was not set, or CORS origin is misconfigured.",
                  fix: "Add credentials: 'include' to every fetch call and ensure CORS_ORIGIN exactly matches your frontend URL.",
                },
              ].map(({ error, cause, fix }) => (
                <div
                  key={error}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="flex items-center gap-2.5 border-b px-4 py-3"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface-2)",
                    }}
                  >
                    <AlertTriangle size={13} style={{ color: "#f59e0b" }} />
                    <code
                      className="font-mono text-xs font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {error}
                    </code>
                  </div>
                  <div
                    className="grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <p
                        className="mb-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Cause
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {cause}
                      </p>
                    </div>
                    <div
                      className="px-4 py-3"
                      style={{ background: "var(--color-surface)" }}
                    >
                      <p
                        className="mb-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: "#22c55e" }}
                      >
                        Fix
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {fix}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <footer
          className="border-t px-6 py-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="flex flex-col items-center justify-between gap-3 text-xs md:flex-row"
            style={{ color: "var(--color-text-muted)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-md"
                style={{ background: "var(--color-accent)" }}
              >
                <Shield size={10} className="text-white" />
              </div>
              <span
                style={{ color: "var(--color-text-secondary)" }}
                className="font-display font-bold"
              >
                AuthFlow
              </span>
              <span className="opacity-40">·</span>
              <span>End-User API · v1.0</span>
            </div>
            <span>Express · TypeScript · MongoDB · AWS S3</span>
          </div>
        </footer>
      </main>
    </div>
  );
}