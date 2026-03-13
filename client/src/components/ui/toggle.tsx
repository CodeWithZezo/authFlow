// ==================== src/components/ui/toggle.tsx ====================
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked:   boolean;
  onChange:  (checked: boolean) => void;
  disabled?: boolean;
  size?:     "sm" | "md";
}

export function Toggle({ checked, onChange, disabled, size = "md" }: ToggleProps) {
  const track = size === "sm"
    ? "h-4 w-7"
    : "h-5 w-9";
  const thumb = size === "sm"
    ? "h-3 w-3 translate-x-0.5 data-[checked=true]:translate-x-3.5"
    : "h-3.5 w-3.5 translate-x-0.5 data-[checked=true]:translate-x-4.5";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      data-checked={checked}
      className={cn(
        "relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-[var(--color-accent)]"
          : "bg-[var(--color-surface-3)] border-[var(--color-border)]",
        track
      )}
    >
      <span
        data-checked={checked}
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm",
          "transition-transform duration-200 ease-in-out",
          thumb
        )}
      />
    </button>
  );
}

// ─── Toggle row — label + description + toggle ──────────────────────────────
interface ToggleRowProps {
  label:       string;
  description?: string;
  checked:     boolean;
  onChange:    (v: boolean) => void;
  disabled?:   boolean;
  badge?:      string;
}

export function ToggleRow({ label, description, checked, onChange, disabled, badge }: ToggleRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 py-4",
      "border-b border-[var(--color-border)] last:border-0"
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
          {badge && (
            <span className="rounded-full bg-[var(--color-accent-dim)] border border-[var(--color-accent)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}
