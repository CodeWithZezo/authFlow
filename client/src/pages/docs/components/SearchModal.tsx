import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Search,
  X,
  ArrowRight,
  Rocket,
  KeyRound,
  Building2,
  FolderKanban,
  Users,
  Shield,
  Activity,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { DOC_SECTIONS, GROUP_LABELS, type DocSection } from "../content-map";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Rocket, KeyRound, Building2, FolderKanban,
  Users, Shield, Activity, ImageIcon,
};

// ─── Search index types ───────────────────────────────────────────────────────
interface HeadingResult {
  type: "heading";
  slug: string;
  sectionLabel: string;
  headingText: string;
  headingId: string;
  headingLevel: 2 | 3;
  excerpt: string;
  icon: string;
}

interface SectionResult {
  type: "section";
  slug: string;
  label: string;
  description: string;
  icon: string;
  group: DocSection["group"];
}

type SearchResult = SectionResult | HeadingResult;

// ─── Build full-text search index from all MD files ───────────────────────────
interface IndexEntry {
  slug: string;
  sectionLabel: string;
  icon: string;
  group: DocSection["group"];
  content: string;           // full raw MD
  headings: { text: string; id: string; level: 2 | 3; bodySnippet: string }[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function extractHeadings(md: string) {
  const lines = md.split("\n");
  const headings: { text: string; id: string; level: 2 | 3; startLine: number }[] = [];

  lines.forEach((line, i) => {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      const text = h2[1].replace(/`[^`]*`/g, (m) => m.slice(1, -1)).trim();
      headings.push({ text, id: slugify(text), level: 2, startLine: i });
    } else if (h3) {
      const text = h3[1].replace(/`[^`]*`/g, (m) => m.slice(1, -1)).trim();
      headings.push({ text, id: slugify(text), level: 3, startLine: i });
    }
  });

  // Build snippet: text between this heading and the next
  return headings.map((h, i) => {
    const nextStart = headings[i + 1]?.startLine ?? lines.length;
    const bodyLines = lines
      .slice(h.startLine + 1, Math.min(h.startLine + 8, nextStart))
      .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("```"))
      .join(" ")
      .replace(/[*_`[\]()]/g, "")
      .trim();
    return { text: h.text, id: h.id, level: h.level, bodySnippet: bodyLines };
  });
}

// ─── Fuzzy score ─────────────────────────────────────────────────────────────
// Returns 0 (no match) – 1 (perfect) based on how well needle fits haystack
function score(haystack: string, needle: string): number {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (h === n) return 1;
  if (h.startsWith(n)) return 0.9;
  if (h.includes(n)) return 0.7;

  // Word-level partial: every word in needle must appear somewhere in haystack
  const words = n.split(/\s+/);
  const allMatch = words.every((w) => h.includes(w));
  if (allMatch) return 0.5;

  // Char sequence match (fuzzy) — each char of needle in order in haystack
  let hi = 0;
  let ni = 0;
  let matched = 0;
  while (hi < h.length && ni < n.length) {
    if (h[hi] === n[ni]) { matched++; ni++; }
    hi++;
  }
  return ni === n.length ? (matched / h.length) * 0.4 : 0;
}

// ─── Highlight matching text ───────────────────────────────────────────────────
function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(108,99,255,0.25)",
          color: "var(--color-accent)",
          borderRadius: "3px",
          padding: "0 2px",
        }}
      >
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (slug: string, headingId?: string) => void;
  activeSlug: string;
}

// ─── SearchModal ─────────────────────────────────────────────────────────────
export function SearchModal({ open, onClose, onNavigate, activeSlug }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<IndexEntry[]>([]);
  const [indexReady, setIndexReady] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Build search index (load all MD files once) ────────────────────────────
  useEffect(() => {
    if (indexReady) return;
    Promise.all(
      DOC_SECTIONS.map(async (sec) => {
        try {
          const mod = await import(`../content/${sec.slug}.md?raw`);
          const content = mod.default as string;
          return {
            slug: sec.slug,
            sectionLabel: sec.label,
            icon: sec.icon,
            group: sec.group,
            content,
            headings: extractHeadings(content),
          } satisfies IndexEntry;
        } catch {
          return {
            slug: sec.slug,
            sectionLabel: sec.label,
            icon: sec.icon,
            group: sec.group,
            content: "",
            headings: [],
          } satisfies IndexEntry;
        }
      })
    ).then((entries) => {
      setIndex(entries);
      setIndexReady(true);
    });
  }, []);

  // ── Focus input when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setFocusedIdx(0);
    }
  }, [open]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // ── Compute results ───────────────────────────────────────────────────────
  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!q) {
      // No query → show all sections
      return DOC_SECTIONS.map((s) => ({
        type: "section",
        slug: s.slug,
        label: s.label,
        description: s.description,
        icon: s.icon,
        group: s.group,
      }));
    }

    const scored: { result: SearchResult; sc: number }[] = [];

    for (const entry of index) {
      // Score the section itself
      const secScore = Math.max(
        score(entry.sectionLabel, q),
        score(entry.content, q) * 0.4
      );
      if (secScore > 0.1) {
        scored.push({
          sc: secScore,
          result: {
            type: "section",
            slug: entry.slug,
            label: entry.sectionLabel,
            description:
              DOC_SECTIONS.find((s) => s.slug === entry.slug)?.description ?? "",
            icon: entry.icon,
            group: entry.group,
          },
        });
      }

      // Score each heading
      for (const h of entry.headings) {
        const hScore = Math.max(
          score(h.text, q) * 0.95,
          score(h.bodySnippet, q) * 0.6
        );
        if (hScore > 0.15) {
          scored.push({
            sc: hScore,
            result: {
              type: "heading",
              slug: entry.slug,
              sectionLabel: entry.sectionLabel,
              headingText: h.text,
              headingId: h.id,
              headingLevel: h.level,
              excerpt: h.bodySnippet.slice(0, 120),
              icon: entry.icon,
            },
          });
        }
      }
    }

    return scored
      .sort((a, b) => b.sc - a.sc)
      .slice(0, 12)
      .map((s) => s.result);
  }, [query, index]);

  // Reset focused index when results change
  useEffect(() => { setFocusedIdx(0); }, [results]);

  // ── Keyboard nav ──────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, results.length - 1));
        listRef.current
          ?.querySelector(`[data-idx="${Math.min(focusedIdx + 1, results.length - 1)}"]`)
          ?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        listRef.current
          ?.querySelector(`[data-idx="${Math.max(focusedIdx - 1, 0)}"]`)
          ?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        const r = results[focusedIdx];
        if (r) {
          if (r.type === "heading") {
            onNavigate(r.slug, r.headingId);
          } else {
            onNavigate(r.slug);
          }
          onClose();
        }
      }
    },
    [results, focusedIdx, onNavigate, onClose]
  );

  const handleSelect = (r: SearchResult) => {
    if (r.type === "heading") {
      onNavigate(r.slug, r.headingId);
    } else {
      onNavigate(r.slug);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-[12vh] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          borderColor: "var(--color-border-2)",
          background: "var(--color-surface)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input row */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Search size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation…"
            className="flex-1 bg-transparent text-[15px] outline-none"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-sans)",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="flex-shrink-0 rounded p-1 transition-colors hover:bg-[var(--color-surface-2)]"
            >
              <X size={13} style={{ color: "var(--color-text-muted)" }} />
            </button>
          )}
          <kbd
            className="flex-shrink-0 rounded-md px-2 py-1 text-[11px]"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
          {!indexReady && (
            <div className="flex items-center justify-center py-8">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]"
              />
            </div>
          )}

          {indexReady && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Search size={24} style={{ color: "var(--color-text-muted)" }} />
              <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
                No results for{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>"{query}"</span>
              </p>
            </div>
          )}

          {indexReady && results.length > 0 && (
            <>
              {!query && (
                <p
                  className="mb-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  All sections
                </p>
              )}
              {query && (
                <p
                  className="mb-1 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              )}

              {results.map((r, i) => {
                const Icon =
                  ICON_MAP[r.icon] ?? Rocket;
                const isFocused = i === focusedIdx;
                const isCurrentPage =
                  r.slug === activeSlug;

                return (
                  <button
                    key={
                      r.type === "heading"
                        ? `${r.slug}#${r.headingId}`
                        : r.slug
                    }
                    data-idx={i}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setFocusedIdx(i)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
                    style={{
                      background: isFocused
                        ? "var(--color-surface-2)"
                        : "transparent",
                      border: isFocused
                        ? "1px solid var(--color-border)"
                        : "1px solid transparent",
                      outline: "none",
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: isFocused
                          ? "rgba(108,99,255,0.15)"
                          : "var(--color-surface-3)",
                        border: `1px solid ${isFocused ? "rgba(108,99,255,0.25)" : "var(--color-border)"}`,
                      }}
                    >
                      <Icon
                        size={13}
                        style={{
                          color: isFocused
                            ? "var(--color-accent)"
                            : "var(--color-text-muted)",
                        }}
                      />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      {r.type === "section" ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {highlight(r.label, query)}
                            </span>
                            <span
                              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                              style={{
                                background: "var(--color-surface-3)",
                                color: "var(--color-text-muted)",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              {GROUP_LABELS[r.group]}
                            </span>
                            {isCurrentPage && (
                              <span
                                className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                                style={{
                                  background: "var(--color-accent-dim)",
                                  color: "var(--color-accent)",
                                  border: "1px solid rgba(108,99,255,0.2)",
                                }}
                              >
                                current
                              </span>
                            )}
                          </div>
                          <p
                            className="mt-0.5 text-[12px] truncate"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {highlight(r.description, query)}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px]"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {r.sectionLabel}
                            </span>
                            <span style={{ color: "var(--color-text-muted)" }}>
                              /
                            </span>
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              {highlight(r.headingText, query)}
                            </span>
                          </div>
                          {r.excerpt && (
                            <p
                              className="mt-0.5 text-[12px] truncate"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {highlight(r.excerpt, query)}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      size={13}
                      className="mt-1 flex-shrink-0 transition-opacity"
                      style={{
                        color: "var(--color-text-muted)",
                        opacity: isFocused ? 1 : 0,
                      }}
                    />
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center gap-4 border-t px-4 py-2.5"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}
        >
          {[
            { keys: ["↑", "↓"], label: "navigate" },
            { keys: ["↵"], label: "open" },
            { keys: ["Esc"], label: "close" },
          ].map(({ keys, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded px-1.5 py-0.5 text-[10px]"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {k}
                </kbd>
              ))}
              <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
