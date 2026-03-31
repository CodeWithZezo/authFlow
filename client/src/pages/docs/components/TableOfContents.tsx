import { useState, useEffect, useRef, useCallback } from "react";

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

interface TableOfContentsProps {
  content: string;
}

// ─── Parse headings from raw markdown ────────────────────────────────────────
// Mirrors what rehype-slug produces: lowercase, spaces→hyphens, strip symbols
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseHeadings(md: string): Heading[] {
  const lines = md.split("\n");
  const headings: Heading[] = [];

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h2) {
      const text = h2[1].replace(/`[^`]*`/g, (m) => m.slice(1, -1)).trim();
      headings.push({ id: slugify(text), text, level: 2 });
    } else if (h3) {
      const text = h3[1].replace(/`[^`]*`/g, (m) => m.slice(1, -1)).trim();
      headings.push({ id: slugify(text), text, level: 3 });
    }
  }
  return headings;
}

// ─── TableOfContents ──────────────────────────────────────────────────────────
export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = parseHeadings(content);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const headingEls = useRef<Map<string, HTMLElement>>(new Map());

  // ── Scroll spy via IntersectionObserver ─────────────────────────────────────
  const setupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    headingEls.current.clear();

    const els: HTMLElement[] = [];
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) {
        headingEls.current.set(h.id, el);
        els.push(el);
      }
    }

    if (els.length === 0) return;

    // Track which headings are visible; pick the topmost one
    const visible = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.add(id);
          } else {
            visible.delete(id);
          }
        }

        // Pick the heading that appears earliest in the document
        if (visible.size > 0) {
          const ordered = headings
            .map((h) => h.id)
            .filter((id) => visible.has(id));
          if (ordered.length > 0) setActiveId(ordered[0]);
        }
      },
      {
        // Fire when heading enters top 20% of viewport
        rootMargin: "0px 0px -75% 0px",
        threshold: 0,
      }
    );

    for (const el of els) {
      observerRef.current.observe(el);
    }
  }, [content]); // re-run when content changes (section navigation)

  useEffect(() => {
    // Small delay so MarkdownRenderer has painted the headings first
    const timer = setTimeout(setupObserver, 120);
    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [setupObserver]);

  // ── Click → smooth scroll ────────────────────────────────────────────────────
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      {/* Label */}
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-text-muted)" }}
      >
        On this page
      </p>

      {/* Heading list */}
      <ul className="relative flex flex-col gap-0.5">
        {/* Left rail */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "var(--color-border)" }}
        />

        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "20px" : "12px" }}>
              <button
                onClick={() => handleClick(h.id)}
                className="w-full text-left transition-all duration-150"
                style={{
                  display: "block",
                  fontSize: h.level === 2 ? "12px" : "11px",
                  fontWeight: isActive ? 500 : 400,
                  lineHeight: 1.5,
                  padding: "3px 0",
                  color: isActive
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: isActive ? 1 : 0.8,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-text-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.color =
                      "var(--color-text-muted)";
                }}
              >
                {h.text}
              </button>

              {/* Active indicator dot on the rail */}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    left: "-3px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    marginTop: "-14px",
                    transition: "top 0.2s ease",
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>

      {/* Back to top */}
      {headings.length > 3 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-5 flex items-center gap-1.5 transition-colors"
          style={{
            color: "var(--color-text-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            padding: 0,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-text-secondary)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              "var(--color-text-muted)")
          }
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M6 10V2M2 6l4-4 4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to top
        </button>
      )}
    </nav>
  );
}
