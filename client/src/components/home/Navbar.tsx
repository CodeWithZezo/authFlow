// ==================== src/components/home/Navbar.tsx ====================
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const navLinks = [
    ["Docs", "/docs"],
    ["Features", "#features"],
    ["Architecture", "#architecture"],
    ["Compare", "#compare"],
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
        background: scrolled ? "rgba(13,13,13,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(4px)" : "none",
      }}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">

        {/* Logo — wordmark with accent tick */}
        <Link to="/" className="flex items-center gap-2 group" style={{ textDecoration: "none" }}>
          <span
            className="inline-block w-1 self-stretch"
            style={{ background: "var(--color-accent)", minHeight: "1.1em" }}
            aria-hidden
          />
          <span
            className="font-display text-lg md:text-xl font-bold tracking-tight text-text-primary"
            style={{ letterSpacing: "-0.03em" }}
          >
            AuthFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="relative px-4 py-2 text-sm transition-colors duration-150 group"
              style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-sans)", fontWeight: 400 }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              {label}
              <span
                className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{ background: "var(--color-accent)" }}
              />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm transition-colors duration-150 px-4 py-2"
            style={{ color: "var(--color-text-muted)", fontWeight: 400 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--color-text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-80 active:opacity-60"
            style={{ background: "var(--color-accent)", borderRadius: 0 }}
          >
            Get started
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: CTA + Hamburger */}
        <div className="flex md:hidden items-center gap-2" ref={menuRef}>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white transition-opacity duration-150 hover:opacity-80"
            style={{ background: "var(--color-accent)", borderRadius: 0 }}
          >
            Get started
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "var(--color-text-secondary)", borderRadius: 0 }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div
              className="absolute top-14 left-0 right-0 border-b px-4 py-4 flex flex-col gap-1"
              style={{
                background: "rgba(13,13,13,0.98)",
                borderColor: "var(--color-border)",
              }}
            >
              {navLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-white/5"
                  style={{ color: "var(--color-text-secondary)", fontWeight: 400 }}
                >
                  {label}
                </a>
              ))}
              <div className="mt-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
