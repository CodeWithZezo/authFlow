import { useState, useRef, useEffect, useCallback } from "react";
import {
  Rocket,
  KeyRound,
  Building2,
  FolderKanban,
  Users,
  Shield,
  Activity,
  ImageIcon,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import type { DocSection } from "../content-map";
import { GROUP_LABELS } from "../content-map";

const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  KeyRound,
  Building2,
  FolderKanban,
  Users,
  Shield,
  Activity,
  ImageIcon,
};

interface SidebarProps {
  sections: DocSection[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function Sidebar({ sections, activeSlug, onSelect }: SidebarProps) {
  const [query, setQuery] = useState("");
  const [focusedSlug, setFocusedSlug] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? sections.filter(
        (s) =>
          s.label.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
      )
    : sections;

  const visibleSlugs = filtered.map((s) => s.slug);

  const groups = (
    ["start", "core", "management", "advanced"] as DocSection["group"][]
  ).map((group) => ({
    key: group,
    label: GROUP_LABELS[group],
    items: filtered.filter((s) => s.group === group),
  }));

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        setFocusedSlug(null);
        searchRef.current?.blur();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const current = focusedSlug ?? activeSlug;
        const idx = visibleSlugs.indexOf(current);
        const next =
          e.key === "ArrowDown"
            ? visibleSlugs[idx + 1] ?? visibleSlugs[0]
            : visibleSlugs[idx - 1] ?? visibleSlugs[visibleSlugs.length - 1];
        if (next) {
          setFocusedSlug(next);
          navRef.current
            ?.querySelector(`[data-slug="${next}"]`)
            ?.scrollIntoView({ block: "nearest" });
        }
        return;
      }
      if (e.key === "Enter" && focusedSlug) {
        onSelect(focusedSlug);
        setFocusedSlug(null);
      }
    },
    [focusedSlug, visibleSlugs, activeSlug, onSelect]
  );

  useEffect(() => { setFocusedSlug(null); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      {/* Search */}
      <div className="border-b px-3 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors focus-within:border-[var(--color-accent)]"
          style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
        >
          <Search size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs..."
            className="flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-[var(--color-text-muted)]"
            style={{ color: "var(--color-text-primary)" }}
            aria-label="Search documentation"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); searchRef.current?.focus(); }}
              className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-[var(--color-surface-3)]"
              aria-label="Clear search"
            >
              <X size={11} style={{ color: "var(--color-text-muted)" }} />
            </button>
          ) : (
            <kbd
              className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{
                background: "var(--color-surface-3)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Nav list */}
      <div ref={navRef} className="flex-1 overflow-y-auto px-2 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <Search size={20} style={{ color: "var(--color-text-muted)" }} />
            <p className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
              No results for{" "}
              <span style={{ color: "var(--color-text-secondary)" }}>"{query}"</span>
            </p>
          </div>
        ) : query.trim() ? (
          <div className="flex flex-col gap-0.5">
            <p
              className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.map((section) => (
              <NavItem
                key={section.slug}
                section={section}
                isActive={section.slug === activeSlug}
                isFocused={section.slug === focusedSlug}
                showDescription
                onSelect={() => { onSelect(section.slug); setQuery(""); setFocusedSlug(null); }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {groups.map(({ key, label, items }) =>
              items.length === 0 ? null : (
                <div key={key} className="mb-4">
                  <p
                    className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </p>
                  {items.map((section) => (
                    <NavItem
                      key={section.slug}
                      section={section}
                      isActive={section.slug === activeSlug}
                      isFocused={section.slug === focusedSlug}
                      showDescription={false}
                      onSelect={() => { onSelect(section.slug); setFocusedSlug(null); }}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            v1.0 · AuthFlow Docs
          </span>
          <div className="flex items-center gap-1.5">
            <kbd
              className="rounded px-1 py-0.5 text-[9px]"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border)",
              }}
            >
              ↑↓
            </kbd>
            <span className="text-[9px]" style={{ color: "var(--color-text-muted)" }}>
              navigate
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────
interface NavItemProps {
  section: DocSection;
  isActive: boolean;
  isFocused: boolean;
  showDescription: boolean;
  onSelect: () => void;
}

function NavItem({ section, isActive, isFocused, showDescription, onSelect }: NavItemProps) {
  const Icon = ICON_MAP[section.icon] ?? Rocket;
  const highlighted = isActive || isFocused;

  return (
    <button
      data-slug={section.slug}
      onClick={onSelect}
      className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left transition-all hover:bg-[var(--color-surface-2)]"
      style={{
        background: isActive
          ? "var(--color-accent-dim)"
          : isFocused
          ? "var(--color-surface-2)"
          : "transparent",
        border: isActive
          ? "1px solid rgba(108,99,255,0.2)"
          : "1px solid transparent",
        outline: "none",
      }}
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
        style={{
          background: highlighted ? "rgba(108,99,255,0.15)" : "var(--color-surface-2)",
          border: `1px solid ${highlighted ? "rgba(108,99,255,0.25)" : "var(--color-border)"}`,
        }}
      >
        <Icon
          size={11}
          style={{ color: highlighted ? "var(--color-accent)" : "var(--color-text-muted)" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-medium leading-snug"
          style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)" }}
        >
          {section.label}
        </p>
        {showDescription && (
          <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--color-text-muted)" }}>
            {section.description}
          </p>
        )}
      </div>

      {isActive && (
        <div
          className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
          style={{ background: "var(--color-accent)" }}
        />
      )}
    </button>
  );
}
