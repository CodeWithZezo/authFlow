// ==================== src/components/shared/MockBanner.tsx ====================
import { useState } from "react";
import { ServerCrash, ChevronDown, ChevronUp, X } from "lucide-react";
import { useMockStore } from "@/store/mock.store";
import { cn } from "@/lib/utils";

export function MockBanner() {
  const { isMockMode } = useMockStore();
  const [expanded, setExpanded]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isMockMode || dismissed) return null;

  return (
    <div className={cn(
      "relative z-50 border-b",
      "border-amber-500/30 bg-amber-500/10",
    )}>
      {/* ── Main row ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-2.5">
        {/* Icon */}
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
          <ServerCrash size={14} className="text-amber-400" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-300">
            Server is not responding
          </p>
          <p className="text-xs text-amber-400/80 mt-0.5">
            You're viewing a demo with mock data — explore how AuthFlow works without a live backend.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Less" : "What's mock?"}
          </button>
          <button
            onClick={() => setDismissed(true)}
            title="Dismiss"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* ── Expanded explanation ──────────────────────────────────────────── */}
      {expanded && (
        <div className={cn(
          "border-t border-amber-500/20 bg-amber-500/5 px-5 py-4",
          "animate-slide-up"
        )}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-3xl">
            {[
              {
                title: "Why am I seeing this?",
                body:  "The backend server couldn't be reached (network error or 500). The app automatically switched to demo mode so you can still explore the UI.",
              },
              {
                title: "What can I do?",
                body:  "Browse every page — orgs, projects, policies, members, sessions. All actions (create, edit, delete) work locally but won't persist after a page refresh.",
              },
              {
                title: "How do I go live?",
                body:  "Start the backend server (npm run dev inside /server) and refresh. Real data will load automatically and this banner will disappear.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="space-y-1">
                <p className="text-xs font-semibold text-amber-300">{title}</p>
                <p className="text-xs text-amber-400/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
