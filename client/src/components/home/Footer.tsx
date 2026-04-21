// ==================== src/components/home/Footer.tsx ====================
import { Link } from "react-router";
import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="border-t py-10 md:py-12"
      style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl"
              style={{ background: "var(--color-accent)" }}
            >
              <Layers size={13} className="text-white" />
            </div>
            <span
              className="font-display text-sm md:text-base font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              AuthFlow
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 md:gap-6">
            {[
              ["Docs", "/docs"],
              ["Sign in", "/login"],
              ["Sign up", "/signup"],
            ].map(([label, href]) => (
              <Link
                key={label}
                to={href}
                className="text-xs md:text-sm transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--color-text-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--color-text-muted)")
                }
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[11px] md:text-xs" style={{ color: "var(--color-text-muted)" }}>
            MIT License · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
