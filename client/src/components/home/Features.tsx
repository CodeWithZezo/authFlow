// ==================== src/components/home/Features.tsx ====================
import {
  Building2, FolderKanban, Shield, KeyRound,
  MonitorSmartphone, Users, Globe, Lock, Zap,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
  tag: string;
}

const FEATURES: Feature[] = [
  {
    icon: Building2,
    title: "Organizations",
    desc: "Top-level multi-tenant workspaces. Owner → Admin → Member hierarchy built in. Unique slug per org.",
    accent: "#6c63ff",
    tag: "Multi-tenant",
  },
  {
    icon: FolderKanban,
    title: "Project Scoping",
    desc: "Projects live inside orgs and control end-user authentication. Each gets its own policies, members, and independent configuration.",
    accent: "#22c55e",
    tag: "RBAC",
  },
  {
    icon: Shield,
    title: "Auth Policies",
    desc: "Per-project rules: auth type (password/OAuth/2FA), allowed methods, phone requirements, custom end-user roles and statuses.",
    accent: "#38bdf8",
    tag: "Configurable",
  },
  {
    icon: KeyRound,
    title: "JWT Rotation",
    desc: "15-minute access tokens + 7-day refresh tokens in httpOnly cookies. Every refresh is single-use — stolen replay tokens just won't work.",
    accent: "#f59e0b",
    tag: "Secure",
  },
  {
    icon: MonitorSmartphone,
    title: "Session Control",
    desc: "Real-time session visibility. Revoke one device or force-logout everywhere. Each session is persisted in MongoDB for auditability.",
    accent: "#ec4899",
    tag: "Revocable",
  },
  {
    icon: Users,
    title: "Dual User Systems",
    desc: "Internal users (your dev team) and end-users (your customers) are completely separate — independent auth flows, stores, and endpoints.",
    accent: "#a78bfa",
    tag: "Isolated",
  },
  {
    icon: Globe,
    title: "Avatar Pipeline",
    desc: "multer → sharp (400×400 JPEG, EXIF stripped) → S3. Raw S3 URLs are never exposed. Served through a secure cookie-authenticated stream.",
    accent: "#34d399",
    tag: "S3-backed",
  },
  {
    icon: Lock,
    title: "Password Policies",
    desc: "Per-project enforcement at signup: min length, require uppercase, numbers, special characters. Validated server-side every time.",
    accent: "#fb923c",
    tag: "Enforced",
  },
  {
    icon: Zap,
    title: "Zero Token Handling",
    desc: "Your frontend never reads or stores tokens. The browser cookie jar handles everything. Just set credentials: 'include' on every request.",
    accent: "#facc15",
    tag: "Cookie-first",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div
      className="group relative overflow-hidden rounded-xl md:rounded-2xl border p-5 md:p-6 transition-all duration-300 cursor-default"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
        el.style.borderColor = `${feature.accent}30`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
        el.style.borderColor = "var(--color-border)";
      }}
    >
      {/* Hover ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% -20%, ${feature.accent}0c 0%, transparent 60%)` }}
      />

      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div
          className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-lg md:rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${feature.accent}18` }}
        >
          <Icon size={17} style={{ color: feature.accent }} />
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[9px] md:text-[10px] font-bold tracking-wide"
          style={{ background: `${feature.accent}12`, color: feature.accent }}
        >
          {feature.tag}
        </span>
      </div>

      <h3
        className="font-display text-[13px] md:text-sm font-bold mb-1.5 md:mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        {feature.title}
      </h3>
      <p
        className="text-[12px] md:text-sm leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {feature.desc}
      </p>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 md:mb-16 text-center max-w-2xl mx-auto">
          <p
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4"
            style={{ color: "var(--color-accent)" }}
          >
            Feature set
          </p>
          <h2
            className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3 md:mb-4"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Everything you'd expect.
            <br />Nothing you'd regret.
          </h2>
          <p className="text-sm md:text-base" style={{ color: "var(--color-text-secondary)" }}>
            Built for teams who need complete control over their auth stack — without per-seat fees or black-box vendor APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
