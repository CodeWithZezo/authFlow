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
  tag: string;
}

const FEATURES: Feature[] = [
  {
    icon: Building2,
    title: "Organizations",
    desc: "Top-level multi-tenant workspaces. Owner → Admin → Member hierarchy built in. Unique slug per org.",
    tag: "Multi-tenant",
  },
  {
    icon: FolderKanban,
    title: "Project Scoping",
    desc: "Projects live inside orgs and control end-user authentication. Each gets its own policies, members, and independent configuration.",
    tag: "RBAC",
  },
  {
    icon: Shield,
    title: "Auth Policies",
    desc: "Per-project rules: auth type (password/OAuth/2FA), allowed methods, phone requirements, custom end-user roles and statuses.",
    tag: "Configurable",
  },
  {
    icon: KeyRound,
    title: "JWT Rotation",
    desc: "15-minute access tokens + 7-day refresh tokens in httpOnly cookies. Every refresh is single-use — stolen replay tokens just won't work.",
    tag: "Secure",
  },
  {
    icon: MonitorSmartphone,
    title: "Session Control",
    desc: "Real-time session visibility. Revoke one device or force-logout everywhere. Each session is persisted in MongoDB for auditability.",
    tag: "Revocable",
  },
  {
    icon: Users,
    title: "Dual User Systems",
    desc: "Internal users (your dev team) and end-users (your customers) are completely separate — independent auth flows, stores, and endpoints.",
    tag: "Isolated",
  },
  {
    icon: Globe,
    title: "Avatar Pipeline",
    desc: "multer → sharp (400×400 JPEG, EXIF stripped) → S3. Raw S3 URLs are never exposed. Served through a secure cookie-authenticated stream.",
    tag: "S3-backed",
  },
  {
    icon: Lock,
    title: "Password Policies",
    desc: "Per-project enforcement at signup: min length, require uppercase, numbers, special characters. Validated server-side every time.",
    tag: "Enforced",
  },
  {
    icon: Zap,
    title: "Zero Token Handling",
    desc: "Your frontend never reads or stores tokens. The browser cookie jar handles everything. Just set credentials: 'include' on every request.",
    tag: "Cookie-first",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div
      className="group border p-6 md:p-7 cursor-default transition-colors duration-150"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)", borderRadius: 0 }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-2)";
        (e.currentTarget as HTMLElement).style.background = "var(--color-surface-2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
        (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
      }}
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className="flex h-9 w-9 items-center justify-center"
          style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}
        >
          <Icon size={15} style={{ color: "var(--color-text-secondary)" }} />
        </div>
        <span
          className="section-label"
          style={{ fontSize: "9px", letterSpacing: "0.1em" }}
        >
          {feature.tag}
        </span>
      </div>

      <h3
        className="font-display text-sm font-bold mb-2"
        style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
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
      <div className="mx-auto max-w-7xl px-6 sm:px-8">

        <div className="mb-12 md:mb-16">
          <p className="section-label mb-4">Feature set</p>
          <h2
            className="font-display font-bold mb-4"
            style={{
              fontSize: "clamp(1.9rem, 4vw, 3rem)",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "var(--color-text-primary)",
            }}
          >
            Everything you'd expect.
            <br />
            <span style={{ color: "var(--color-accent)" }}>Nothing you'd regret.</span>
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: "var(--color-text-secondary)", maxWidth: "52ch" }}
          >
            Built for teams who need complete control over their auth stack — without per-seat fees or black-box vendor APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ background: "var(--color-border)" }}>
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>

      </div>
    </section>
  );
}
