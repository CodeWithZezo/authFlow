// ==================== src/store/session.store.ts ====================
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Session } from "@/types";
import { useAuthStore } from "./auth.store";
import { useMockStore, shouldUseMock } from "./mock.store";
import { MOCK_SESSIONS } from "./mock.data";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface SessionState {
  sessions: Session[];
  status: { fetchSessions: SS; revokeSession: SS; revokeAll: SS; };
  fetchSessions:  () => Promise<void>;
  revokeSession:  (sessionId: string) => Promise<boolean>;
  revokeAll:      () => Promise<boolean>;
  clearError:     (a: keyof SessionState["status"]) => void;
  reset:          () => void;
}

import { apiUrl } from "@/lib/config";

const BASE = apiUrl("/api/v1/sessions");

async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    // Guard: Vite proxy returns HTML (not JSON) when backend is down — parse safely
    let json: any = null;
    try { json = await res.json(); } catch { /* non-JSON body */ }
    if (!res.ok || json === null) {
      const msg = json?.message ?? (res.status ? `Server error ${res.status}` : "Network error");
      return { data: null, error: msg };
    }
    return { data: json, error: null };
  } catch (e: unknown) { return { data: null, error: (e as Error).message }; }
}

const init = {
  sessions: [],
  status: { fetchSessions: ds(), revokeSession: ds(), revokeAll: ds() },
};

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, _get) => ({
      ...init,

      fetchSessions: async () => {
        set((s) => ({ status: { ...s.status, fetchSessions: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          set((s) => ({ sessions: MOCK_SESSIONS, status: { ...s.status, fetchSessions: ds() } }));
          return;
        }
        const { data, error } = await req<{ sessions: Session[] }>(BASE);
        if (shouldUseMock(error)) {
          useMockStore.getState().activateMock();
          set((s) => ({ sessions: MOCK_SESSIONS, status: { ...s.status, fetchSessions: ds() } }));
          return;
        }
        if (error || !data) { set((s) => ({ status: { ...s.status, fetchSessions: { loading: false, error } } })); return; }
        set((s) => ({ sessions: data.sessions, status: { ...s.status, fetchSessions: ds() } }));
      },

      revokeSession: async (sessionId) => {
        set((s) => ({ status: { ...s.status, revokeSession: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 300));
          set((s) => ({ sessions: s.sessions.filter((s) => s._id !== sessionId), status: { ...s.status, revokeSession: ds() } }));
          return true;
        }
        const { error } = await req(`${BASE}/${sessionId}`, { method: "DELETE" });
        if (error) { set((s) => ({ status: { ...s.status, revokeSession: { loading: false, error } } })); return false; }
        set((s) => ({ sessions: s.sessions.filter((s) => s._id !== sessionId), status: { ...s.status, revokeSession: ds() } }));
        return true;
      },

      revokeAll: async () => {
        set((s) => ({ status: { ...s.status, revokeAll: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 400));
          set((s) => ({ sessions: [], status: { ...s.status, revokeAll: ds() } }));
          useMockStore.getState().deactivateMock();
          await useAuthStore.getState().logout();
          return true;
        }
        const { error } = await req(BASE, { method: "DELETE" });
        if (error) { set((s) => ({ status: { ...s.status, revokeAll: { loading: false, error } } })); return false; }
        set((s) => ({ sessions: [], status: { ...s.status, revokeAll: ds() } }));
        await useAuthStore.getState().logout();
        return true;
      },

      clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
      reset: () => set({ ...init }),
    }),
    { name: "SessionStore" }
  )
);
