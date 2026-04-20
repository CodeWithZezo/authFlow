// ==================== src/store/auth.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { AuthUser, LoginPayload, SignupPayload, UpdateProfilePayload } from "@/types";
import { useMockStore, shouldUseMock } from "./mock.store";
import { MOCK_USER } from "./mock.data";

interface SliceStatus { loading: boolean; error: string | null }
const ds = (): SliceStatus => ({ loading: false, error: null });

interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  _hydrated:       boolean;
  status: {
    signup:         SliceStatus;
    login:          SliceStatus;
    logout:         SliceStatus;
    fetchMe:        SliceStatus;
    refreshToken:   SliceStatus;
    changePassword: SliceStatus;
    updateProfile:  SliceStatus;
    uploadAvatar:   SliceStatus;
    deleteAvatar:   SliceStatus;
  };
  signup:         (p: SignupPayload) => Promise<boolean>;
  login:          (p: LoginPayload)  => Promise<boolean>;
  logout:         ()                 => Promise<void>;
  fetchMe:        ()                 => Promise<void>;
  refreshToken:   ()                 => Promise<boolean>;
  changePassword: (curr: string, next: string) => Promise<boolean>;
  updateProfile:  (p: UpdateProfilePayload) => Promise<boolean>;
  uploadAvatar:   (file: File) => Promise<boolean>;
  deleteAvatar:   () => Promise<boolean>;
  clearError:     (a: keyof AuthState["status"]) => void;
  reset:          () => void;
}

import { apiUrl } from "@/lib/config";

const API = apiUrl("/api/v1/auth");

async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    // Guard: if proxy/server returns non-JSON (e.g. HTML 502 from Vite proxy when backend is down)
    // parse carefully so we don't lose the HTTP status in a SyntaxError
    let json: any = null;
    try { json = await res.json(); } catch { /* non-JSON body — treat as server down */ }
    if (!res.ok || json === null) {
      const msg = json?.message ?? (res.status ? `Server error ${res.status}` : "Network error");
      return { data: null, error: msg };
    }
    return { data: json, error: null };
  } catch (e: unknown) {
    return { data: null, error: (e as Error).message ?? "Network error" };
  }
}

const init = {
  user: null,
  isAuthenticated: false,
  _hydrated: false,
  status: {
    signup: ds(), login: ds(), logout: ds(), fetchMe: ds(),
    refreshToken: ds(), changePassword: ds(),
    updateProfile: ds(), uploadAvatar: ds(), deleteAvatar: ds(),
  },
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...init,

        signup: async (payload) => {
          set((s) => ({ status: { ...s.status, signup: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/signup`, { method: "POST", body: JSON.stringify(payload) });
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ user: MOCK_USER, isAuthenticated: true, status: { ...s.status, signup: ds() } }));
            return true;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, signup: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, signup: ds() } }));
          return true;
        },

        login: async (payload) => {
          set((s) => ({ status: { ...s.status, login: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/login`, { method: "POST", body: JSON.stringify(payload) });
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ user: MOCK_USER, isAuthenticated: true, status: { ...s.status, login: ds() } }));
            return true;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, login: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, login: ds() } }));
          return true;
        },

        logout: async () => {
          set((s) => ({ status: { ...s.status, logout: { loading: true, error: null } } }));
          if (!useMockStore.getState().isMockMode) {
            await req(`${API}/logout`, { method: "POST" });
          }
          useMockStore.getState().deactivateMock();
          get().reset();
        },

        fetchMe: async () => {
          set((s) => ({ status: { ...s.status, fetchMe: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            set((s) => ({ user: MOCK_USER, isAuthenticated: true, status: { ...s.status, fetchMe: ds() } }));
            return;
          }
          const { data, error } = await req<{ user: any }>(`${API}/me`);
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ user: MOCK_USER, isAuthenticated: true, status: { ...s.status, fetchMe: ds() } }));
            return;
          }
          if (error || !data) {
            set((s) => ({ isAuthenticated: false, status: { ...s.status, fetchMe: { loading: false, error } } }));
            return;
          }
          const raw = data.user;
          const { data: profileData } = await req<{ user: any }>(`${API}/profile`);
          const user: AuthUser = {
            id:         raw.id ?? raw._id?.toString(),
            fullName:   raw.fullName,
            email:      raw.email,
            phone:      raw.phone ?? null,
            isVerified: raw.isVerified,
            avatarUrl:  profileData?.user?.avatarUrl ?? null,
          };
          set((s) => ({ user, isAuthenticated: true, status: { ...s.status, fetchMe: ds() } }));
        },

        refreshToken: async () => {
          if (useMockStore.getState().isMockMode) return true;
          set((s) => ({ status: { ...s.status, refreshToken: { loading: true, error: null } } }));
          const { data, error } = await req<{ user: AuthUser }>(`${API}/refresh-token`, { method: "POST" });
          if (error || !data) { set((s) => ({ status: { ...s.status, refreshToken: { loading: false, error } } })); return false; }
          set((s) => ({ user: data.user, isAuthenticated: true, status: { ...s.status, refreshToken: ds() } }));
          return true;
        },

        changePassword: async (currentPassword, newPassword) => {
          set((s) => ({ status: { ...s.status, changePassword: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 600));
            set((s) => ({ status: { ...s.status, changePassword: ds() } }));
            return true;
          }
          const { error } = await req(`${API}/change-password`, { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });
          if (error) { set((s) => ({ status: { ...s.status, changePassword: { loading: false, error } } })); return false; }
          set((s) => ({ status: { ...s.status, changePassword: ds() } }));
          return true;
        },

        updateProfile: async (payload) => {
          set((s) => ({ status: { ...s.status, updateProfile: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 500));
            set((s) => ({
              user: s.user ? { ...s.user, ...payload } : s.user,
              status: { ...s.status, updateProfile: ds() },
            }));
            return true;
          }
          const { data, error } = await req<{ user: any }>(`${API}/profile`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateProfile: { loading: false, error } } })); return false; }
          const raw = data.user;
          set((s) => ({
            user: s.user ? {
              ...s.user,
              fullName:  raw.fullName  ?? s.user.fullName,
              phone:     raw.phone     ?? s.user.phone,
              avatarUrl: raw.avatarUrl ?? s.user.avatarUrl,
            } : s.user,
            status: { ...s.status, updateProfile: ds() },
          }));
          return true;
        },

        uploadAvatar: async (file) => {
          set((s) => ({ status: { ...s.status, uploadAvatar: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 800));
            set((s) => ({ status: { ...s.status, uploadAvatar: ds() } }));
            return true;
          }
          const form = new FormData();
          form.append("avatar", file);
          try {
            const res  = await fetch(`${API}/avatar`, { method: "PATCH", credentials: "include", body: form });
            const json = await res.json();
            if (!res.ok) { set((s) => ({ status: { ...s.status, uploadAvatar: { loading: false, error: json?.message ?? "Upload failed" } } })); return false; }
            set((s) => ({
              user: s.user ? { ...s.user, avatarUrl: json.avatarUrl ?? s.user.avatarUrl } : s.user,
              status: { ...s.status, uploadAvatar: ds() },
            }));
            return true;
          } catch (e: unknown) {
            set((s) => ({ status: { ...s.status, uploadAvatar: { loading: false, error: (e as Error).message } } }));
            return false;
          }
        },

        deleteAvatar: async () => {
          set((s) => ({ status: { ...s.status, deleteAvatar: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({ user: s.user ? { ...s.user, avatarUrl: null } : s.user, status: { ...s.status, deleteAvatar: ds() } }));
            return true;
          }
          const { error } = await req(`${API}/avatar`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, deleteAvatar: { loading: false, error } } })); return false; }
          set((s) => ({ user: s.user ? { ...s.user, avatarUrl: null } : s.user, status: { ...s.status, deleteAvatar: ds() } }));
          return true;
        },

        clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
        reset: () => set({ ...init, _hydrated: true }),
      }),
      {
        name: "auth-store",
        partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
        onRehydrateStorage: () => (state) => { if (state) state._hydrated = true; },
      }
    ),
    { name: "AuthStore" }
  )
);
