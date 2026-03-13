// ==================== src/components/shared/PageHeader.tsx ====================
import type { ReactNode } from "react";
import type { BreadcrumbItem } from "@/types";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-2">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={12} />}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-[var(--color-text-secondary)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-text-secondary)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}


// ==================== src/components/shared/EmptyState.tsx ====================
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <Icon size={24} className="text-[var(--color-text-muted)]" />
        </div>
      )}
      <p className="font-display text-lg font-semibold text-[var(--color-text-primary)]">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}


// ==================== src/components/shared/StatusBadge.tsx ====================
import { STATUS_CONFIG, ROLE_CONFIG, cn } from "@/lib/utils";
import type { Status, Role } from "@/types";

export function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("badge border text-xs", cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={cn("badge border text-xs", cfg.color)}>
      {cfg.label}
    </span>
  );
}


// ==================== src/components/shared/Spinner.tsx ====================
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]"
      style={{ width: size, height: size }}
    />
  );
}


// ==================== src/components/shared/ErrorMessage.tsx ====================
import { AlertCircle, X } from "lucide-react";

interface ErrorMessageProps {
  message: string | null;
  onClose?: () => void;
}

export function ErrorMessage({ message, onClose }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:text-red-300 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
