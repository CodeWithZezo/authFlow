// ==================== src/store/auth.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { AuthUser, LoginPayload, SignupPayload } from "@/types";

interface SliceStatus { loading: boolean; error: string | null }
const ds = (): SliceStatus => ({ loading: false, error: null });

interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  _hydrated:       boolean; // true once Zustand persist has rehydrated from localStorage
  status: {
    signup:         SliceStatus;
    login:          SliceStatus;
    logout:         SliceStatus;
    fetchMe:        SliceStatus;
    refreshToken:   SliceStatus;
    changePassword: SliceStatus;
  };
  signup:         (p: SignupPayload) => Promise<boolean>;
  login:          (p: LoginPayload)  => Promise<boolean>;
  logout:         ()                 => Promise<void>;
  fetchMe:        ()                 => Promise<void>;
  refreshToken:   ()                 => Promise<boolean>;
  changePassword: (curr: string, next: string) => Promise<boolean>;
  clearError:     (a: keyof AuthState["status"]) => void;
  reset:          () => void;
}

const API = "/api/v1/auth";

async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res  = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json?.message ?? "Something went wrong" };
    return { data: json, error: null };
  } catch (e: unknown) {
    return { data: null, error: (e as Error).message ?? "Network error" };
  }
}

const init = {
  user: null,
  isAuthenticated: false,
  _hydrated: false,
  status: { signup: ds(), login: ds(), logout: ds(), fetchMe: ds(), refreshToken: ds(), changePassword: ds() },
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...init,

        signup: async (payload) => {
          set((s) => ({ status: { ...s.status, signup: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/signup`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, signup: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, signup: ds() } }));
          return true;
        },

        login: async (payload) => {
          set((s) => ({ status: { ...s.status, login: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/login`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, login: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, login: ds() } }));
          return true;
        },

        logout: async () => {
          set((s) => ({ status: { ...s.status, logout: { loading: true, error: null } } }));
          await req(`${API}/logout`, { method: "POST" });
          get().reset();
        },

        fetchMe: async () => {
          set((s) => ({ status: { ...s.status, fetchMe: { loading: true, error: null } } }));
          // Backend /me returns raw Mongoose doc with _id, not id
          const { data, error } = await req<{ user: any }>(`${API}/me`);
          if (error || !data) {
            set((s) => ({ isAuthenticated: false, status: { ...s.status, fetchMe: { loading: false, error } } }));
            return;
          }
          // Normalize _id → id
          const raw = data.user;
          const user: AuthUser = {
            id:         raw.id ?? raw._id?.toString(),
            fullName:   raw.fullName,
            email:      raw.email,
            phone:      raw.phone ?? null,
            isVerified: raw.isVerified,
          };
          set((s) => ({ user, isAuthenticated: true, status: { ...s.status, fetchMe: ds() } }));
        },

        refreshToken: async () => {
          set((s) => ({ status: { ...s.status, refreshToken: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/refresh-token`, { method: "POST" });
          if (error || !data) { set((s) => ({ status: { ...s.status, refreshToken: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, refreshToken: ds() } }));
          return true;
        },

        changePassword: async (currentPassword, newPassword) => {
          set((s) => ({ status: { ...s.status, changePassword: { loading: true, error: null } } }));
          const { error } = await req(`${API}/change-password`, { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });
          if (error) { set((s) => ({ status: { ...s.status, changePassword: { loading: false, error } } })); return false; }
          set((s) => ({ status: { ...s.status, changePassword: ds() } }));
          return true;
        },

        clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
        reset: () => set({ ...init, _hydrated: true }),
      }),
      {
        name: "auth-store",
        partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
        onRehydrateStorage: () => (state) => {
          // Fires once localStorage has been read — safe to check isAuthenticated now
          if (state) state._hydrated = true;
        },
      }
    ),
    { name: "AuthStore" }
  )
);
