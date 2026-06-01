import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineScreen() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline  = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  const handleRetry = () => {
    setChecking(true);
    // Give the browser a moment to re-check connectivity, then sync state
    setTimeout(() => {
      setOffline(!navigator.onLine);
      setChecking(false);
    }, 1200);
  };

  if (!offline) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "var(--color-bg)" }}
      role="alert"
      aria-live="assertive"
    >
      {/* Icon */}
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
        }}
      >
        <WifiOff size={36} style={{ color: "var(--color-text-muted)" }} />
      </div>

      {/* Text */}
      <h1
        className="font-display text-2xl font-bold tracking-tight mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        You're offline
      </h1>
      <p
        className="text-sm text-center max-w-xs mb-8"
        style={{ color: "var(--color-text-muted)", lineHeight: 1.7 }}
      >
        No internet connection detected.
        <br />
        Check your network and try again.
      </p>

      {/* Retry button */}
      <button
        onClick={handleRetry}
        disabled={checking}
        className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
          cursor: checking ? "not-allowed" : "pointer",
        }}
      >
        <RefreshCw
          size={14}
          className={checking ? "animate-spin" : ""}
          style={{ color: "var(--color-accent)" }}
        />
        {checking ? "Checking…" : "Try again"}
      </button>

      {/* Subtle footer */}
      <p
        className="absolute bottom-8 text-xs tracking-widest uppercase"
        style={{ color: "var(--color-text-muted)", opacity: 0.4 }}
      >
        AuthFlow
      </p>
    </div>
  );
}
