// ==================== src/components/home/Navbar.tsx ====================
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Layers, ArrowRight, Menu, X } from "lucide-react";

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
        background: scrolled ? "rgba(9,9,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="mx-auto flex h-14 md:h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 20px rgba(108,99,255,0.45)" }}
          >
            <Layers size={15} className="text-white" />
          </div>
          <span
            className="font-display text-lg md:text-xl font-bold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            AuthFlow
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium transition-colors hover:text-white px-4 py-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--color-accent)", boxShadow: "0 0 22px rgba(108,99,255,0.35)" }}
          >
            Get started
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: CTA + Hamburger */}
        <div className="flex md:hidden items-center gap-2" ref={menuRef}>
          <Link
            to="/signup"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white"
            style={{ background: "var(--color-accent)" }}
          >
            Get started
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div
              className="absolute top-14 left-0 right-0 border-b px-4 py-4 flex flex-col gap-1"
              style={{
                background: "rgba(9,9,15,0.97)",
                borderColor: "var(--color-border)",
                backdropFilter: "blur(20px)",
              }}
            >
              {navLinks.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {label}
                </a>
              ))}
              <div className="mt-2 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium"
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
