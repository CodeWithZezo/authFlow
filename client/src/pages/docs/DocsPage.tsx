import { Suspense, lazy, useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { Shield, Search } from "lucide-react";
import {
  DOC_SECTIONS,
  DEFAULT_SECTION,
  loadDocContent,
} from "./content-map";
import { SearchModal } from "./components/SearchModal";

const Sidebar = lazy(() =>
  import("./components/Sidebar").then((m) => ({ default: m.Sidebar }))
);
const MarkdownRenderer = lazy(() =>
  import("./components/MarkdownRenderer").then((m) => ({
    default: m.MarkdownRenderer,
  }))
);
const TableOfContents = lazy(() =>
  import("./components/TableOfContents").then((m) => ({
    default: m.TableOfContents,
  }))
);

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4" style={{ background: "var(--color-surface)" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-8 animate-pulse rounded-lg"
          style={{ background: "var(--color-surface-2)", width: `${60 + (i * 7) % 30}%` }}
        />
      ))}
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-8 py-10">
      <div className="h-10 w-64 animate-pulse rounded-xl" style={{ background: "var(--color-surface-2)" }} />
      <div className="h-4 w-full animate-pulse rounded-lg" style={{ background: "var(--color-surface-2)" }} />
      <div className="h-4 w-5/6 animate-pulse rounded-lg" style={{ background: "var(--color-surface-2)" }} />
      <div className="h-4 w-4/6 animate-pulse rounded-lg" style={{ background: "var(--color-surface-2)" }} />
      <div className="mt-4 h-32 w-full animate-pulse rounded-xl" style={{ background: "var(--color-surface-2)" }} />
    </div>
  );
}

export function DocsPage() {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();

  const [mdContent, setMdContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const activeSlug = section ?? DEFAULT_SECTION;

  const isValidSlug = DOC_SECTIONS.some((s) => s.slug === activeSlug);
  if (!isValidSlug) {
    return <Navigate to={`/docs/${DEFAULT_SECTION}`} replace />;
  }

  useEffect(() => {
    setIsLoading(true);
    setMdContent("");
    loadDocContent(activeSlug).then((content) => {
      setMdContent(content);
      setIsLoading(false);
    });
  }, [activeSlug]);

  // Global Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSectionChange = (slug: string) => {
    navigate(`/docs/${slug}`);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Navigate from search — optionally scroll to a heading after load
  const handleSearchNavigate = (slug: string, headingId?: string) => {
    if (slug !== activeSlug) {
      navigate(`/docs/${slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (headingId) {
        // Wait for MarkdownRenderer to paint, then scroll to heading
        setTimeout(() => {
          document.getElementById(headingId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 400);
      }
    } else if (headingId) {
      document.getElementById(headingId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-bg)", fontFamily: "var(--font-sans)" }}
    >
      {/* Search modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSearchNavigate}
        activeSlug={activeSlug}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left sidebar ──────────────────────────────────────────────────────── */}
      <aside
        className={[
          "fixed top-0 left-0 z-50 h-screen w-64 flex-shrink-0 overflow-y-auto border-r transition-transform duration-300",
          "lg:sticky lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {/* Logo + search icon */}
        <div
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--color-accent)" }}
            >
              <Shield size={13} className="text-white" />
            </div>
            <div>
              <p
                className="font-display text-sm font-bold leading-none"
                style={{ color: "var(--color-text-primary)" }}
              >
                AuthFlow
              </p>
              <p className="mt-0.5 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                Documentation
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
            title="Search (⌘K)"
            aria-label="Open search"
          >
            <Search size={14} style={{ color: "var(--color-text-muted)" }} />
          </button>
        </div>

        <Suspense fallback={<SidebarSkeleton />}>
          <Sidebar
            sections={DOC_SECTIONS}
            activeSlug={activeSlug}
            onSelect={handleSectionChange}
          />
        </Suspense>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-2)] lg:hidden"
              aria-label="Open sidebar"
            >
              <span className="flex flex-col gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block h-0.5 w-4 rounded-full"
                    style={{ background: "var(--color-text-secondary)" }}
                  />
                ))}
              </span>
            </button>
            <span
              className="font-display text-sm font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {DOC_SECTIONS.find((s) => s.slug === activeSlug)?.label ?? "Docs"}
            </span>
          </div>

          {/* Search pill — always visible */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors hover:bg-[var(--color-surface-2)]"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text-muted)",
            }}
          >
            <Search size={13} />
            <span className="hidden text-[12px] sm:inline">Search docs…</span>
            <kbd
              className="hidden rounded px-1.5 py-0.5 text-[10px] sm:flex"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </header>

        {/* Content + TOC */}
        <div className="flex flex-1 gap-0">
          <main className="min-w-0 flex-1 px-6 py-10 md:px-10 xl:px-14">
            <Suspense fallback={<ContentSkeleton />}>
              {isLoading ? <ContentSkeleton /> : <MarkdownRenderer content={mdContent} />}
            </Suspense>
          </main>

          <aside className="hidden w-56 flex-shrink-0 xl:block">
            <div className="sticky top-16 py-10 pr-6">
              <Suspense fallback={null}>
                {!isLoading && mdContent && <TableOfContents content={mdContent} />}
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
