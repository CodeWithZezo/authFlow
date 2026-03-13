// ==================== src/components/shared/StatsCard.tsx ====================
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label:    string;
  value:    string | number;
  icon:     LucideIcon;
  accent?:  string;
  trend?:   { value: string; up: boolean };
  loading?: boolean;
}

export function StatsCard({ label, value, icon: Icon, accent = "var(--color-accent)", trend, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded-full bg-[var(--color-surface-3)]" />
            <div className="h-7 w-12 rounded-lg bg-[var(--color-surface-3)]" />
          </div>
          <div className="h-9 w-9 rounded-xl bg-[var(--color-surface-3)]" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "card p-5 group cursor-default",
      "hover:border-[var(--color-border-2)] transition-all duration-200",
      "hover:shadow-[var(--shadow)]"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="section-label">{label}</p>
          <p className="font-display text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.up ? "text-green-400" : "text-red-400"
            )}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
          style={{ background: `color-mix(in oklch, ${accent} 15%, transparent)` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}
