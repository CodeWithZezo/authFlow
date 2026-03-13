// ==================== src/store/session.store.ts ====================
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Session } from "@/types";
import { useAuthStore } from "./auth.store";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface SessionState {
  sessions: Session[];
  status: {
    fetchSessions:  SS;
    revokeSession:  SS;
    revokeAll:      SS;
  };
  fetchSessions:  () => Promise<void>;
  revokeSession:  (sessionId: string) => Promise<boolean>;
  revokeAll:      () => Promise<boolean>;
  clearError:     (a: keyof SessionState["status"]) => void;
  reset:          () => void;
}

const BASE = "/api/v1/sessions";

async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res  = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json?.message ?? "Something went wrong" };
    return { data: json, error: null };
  } catch (e: unknown) { return { data: null, error: (e as Error).message }; }
}

const init = {
  sessions: [],
  status: { fetchSessions: ds(), revokeSession: ds(), revokeAll: ds() },
};

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      ...init,

      fetchSessions: async () => {
        set((s) => ({ status: { ...s.status, fetchSessions: { loading: true, error: null } } }));
        const { data, error } = await req<{ sessions: Session[] }>(BASE);
        if (error || !data) {
          set((s) => ({ status: { ...s.status, fetchSessions: { loading: false, error } } }));
          return;
        }
        set((s) => ({ sessions: data.sessions, status: { ...s.status, fetchSessions: ds() } }));
      },

      revokeSession: async (sessionId) => {
        set((s) => ({ status: { ...s.status, revokeSession: { loading: true, error: null } } }));
        const { error } = await req(`${BASE}/${sessionId}`, { method: "DELETE" });
        if (error) {
          set((s) => ({ status: { ...s.status, revokeSession: { loading: false, error } } }));
          return false;
        }
        set((s) => ({
          sessions: s.sessions.filter((s) => s._id !== sessionId),
          status: { ...s.status, revokeSession: ds() },
        }));
        return true;
      },

      revokeAll: async () => {
        set((s) => ({ status: { ...s.status, revokeAll: { loading: true, error: null } } }));
        const { error } = await req(BASE, { method: "DELETE" });
        if (error) {
          set((s) => ({ status: { ...s.status, revokeAll: { loading: false, error } } }));
          return false;
        }
        set((s) => ({ sessions: [], status: { ...s.status, revokeAll: ds() } }));
        // Log out current user too since all sessions cleared
        await useAuthStore.getState().logout();
        return true;
      },

      clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
      reset: () => set({ ...init }),
    }),
    { name: "SessionStore" }
  )
);
