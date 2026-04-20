// ==================== src/store/policy.store.ts ====================
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ProjectPolicy, PasswordPolicy, CreateProjectPolicyPayload, CreatePasswordPolicyPayload } from "@/types";
import { useMockStore, shouldUseMock } from "./mock.store";
import { MOCK_PROJECT_POLICY, MOCK_PASSWORD_POLICY } from "./mock.data";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface PolicyState {
  projectPolicy:  ProjectPolicy | null;
  passwordPolicy: PasswordPolicy | null;
  status: {
    fetchProjectPolicy: SS; createProjectPolicy: SS;
    updateProjectPolicy: SS; deleteProjectPolicy: SS;
    fetchPasswordPolicy: SS; createPasswordPolicy: SS;
    updatePasswordPolicy: SS; deletePasswordPolicy: SS;
  };
  fetchProjectPolicy:   (projectId: string) => Promise<void>;
  createProjectPolicy:  (projectId: string, p: CreateProjectPolicyPayload) => Promise<boolean>;
  updateProjectPolicy:  (projectId: string, p: Partial<CreateProjectPolicyPayload>) => Promise<boolean>;
  deleteProjectPolicy:  (projectId: string) => Promise<boolean>;
  fetchPasswordPolicy:  (projectId: string) => Promise<void>;
  createPasswordPolicy: (projectId: string, p: CreatePasswordPolicyPayload) => Promise<boolean>;
  updatePasswordPolicy: (projectId: string, p: Partial<CreatePasswordPolicyPayload>) => Promise<boolean>;
  deletePasswordPolicy: (projectId: string) => Promise<boolean>;
  clearError: (a: keyof PolicyState["status"]) => void;
  reset:      () => void;
}

import { apiUrl } from "@/lib/config";

const PROJ_API = (projectId: string) => apiUrl(`/api/v1/projects/${projectId}`);

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
  projectPolicy: null, passwordPolicy: null,
  status: {
    fetchProjectPolicy: ds(), createProjectPolicy: ds(),
    updateProjectPolicy: ds(), deleteProjectPolicy: ds(),
    fetchPasswordPolicy: ds(), createPasswordPolicy: ds(),
    updatePasswordPolicy: ds(), deletePasswordPolicy: ds(),
  },
};

export const usePolicyStore = create<PolicyState>()(
  devtools(
    (set) => ({
      ...init,

      fetchProjectPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, fetchProjectPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          set((s) => ({ projectPolicy: MOCK_PROJECT_POLICY, status: { ...s.status, fetchProjectPolicy: ds() } }));
          return;
        }
        const { data, error } = await req<{ policy: ProjectPolicy }>(`${PROJ_API(projectId)}/policy`);
        if (shouldUseMock(error)) {
          useMockStore.getState().activateMock();
          set((s) => ({ projectPolicy: MOCK_PROJECT_POLICY, status: { ...s.status, fetchProjectPolicy: ds() } }));
          return;
        }
        if (error || !data) { set((s) => ({ projectPolicy: null, status: { ...s.status, fetchProjectPolicy: ds() } })); return; }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, fetchProjectPolicy: ds() } }));
      },

      createProjectPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, createProjectPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 400));
          set((s) => ({ projectPolicy: { ...MOCK_PROJECT_POLICY, ...payload }, status: { ...s.status, createProjectPolicy: ds() } }));
          return true;
        }
        const { data, error } = await req<{ policy: ProjectPolicy }>(`${PROJ_API(projectId)}/policy`, { method: "POST", body: JSON.stringify(payload) });
        if (error || !data) { set((s) => ({ status: { ...s.status, createProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, createProjectPolicy: ds() } }));
        return true;
      },

      updateProjectPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, updateProjectPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 400));
          set((s) => ({ projectPolicy: s.projectPolicy ? { ...s.projectPolicy, ...payload } : s.projectPolicy, status: { ...s.status, updateProjectPolicy: ds() } }));
          return true;
        }
        const { data, error } = await req<{ policy: ProjectPolicy }>(`${PROJ_API(projectId)}/policy`, { method: "PATCH", body: JSON.stringify(payload) });
        if (error || !data) { set((s) => ({ status: { ...s.status, updateProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, updateProjectPolicy: ds() } }));
        return true;
      },

      deleteProjectPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, deleteProjectPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 300));
          set((s) => ({ projectPolicy: null, status: { ...s.status, deleteProjectPolicy: ds() } }));
          return true;
        }
        const { error } = await req(`${PROJ_API(projectId)}/policy`, { method: "DELETE" });
        if (error) { set((s) => ({ status: { ...s.status, deleteProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: null, status: { ...s.status, deleteProjectPolicy: ds() } }));
        return true;
      },

      fetchPasswordPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, fetchPasswordPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          set((s) => ({ passwordPolicy: MOCK_PASSWORD_POLICY, status: { ...s.status, fetchPasswordPolicy: ds() } }));
          return;
        }
        const { data, error } = await req<{ policy: PasswordPolicy }>(`${PROJ_API(projectId)}/password-policy`);
        if (shouldUseMock(error)) {
          useMockStore.getState().activateMock();
          set((s) => ({ passwordPolicy: MOCK_PASSWORD_POLICY, status: { ...s.status, fetchPasswordPolicy: ds() } }));
          return;
        }
        if (error || !data) { set((s) => ({ passwordPolicy: null, status: { ...s.status, fetchPasswordPolicy: ds() } })); return; }
        set((s) => ({ passwordPolicy: data.policy, status: { ...s.status, fetchPasswordPolicy: ds() } }));
      },

      createPasswordPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, createPasswordPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 400));
          set((s) => ({ passwordPolicy: { ...MOCK_PASSWORD_POLICY, ...payload }, status: { ...s.status, createPasswordPolicy: ds() } }));
          return true;
        }
        const { data, error } = await req<{ policy: PasswordPolicy }>(`${PROJ_API(projectId)}/password-policy`, { method: "POST", body: JSON.stringify(payload) });
        if (error || !data) { set((s) => ({ status: { ...s.status, createPasswordPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ passwordPolicy: data.policy, status: { ...s.status, createPasswordPolicy: ds() } }));
        return true;
      },

      updatePasswordPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, updatePasswordPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 400));
          set((s) => ({ passwordPolicy: s.passwordPolicy ? { ...s.passwordPolicy, ...payload } : s.passwordPolicy, status: { ...s.status, updatePasswordPolicy: ds() } }));
          return true;
        }
        const { data, error } = await req<{ policy: PasswordPolicy }>(`${PROJ_API(projectId)}/password-policy`, { method: "PATCH", body: JSON.stringify(payload) });
        if (error || !data) { set((s) => ({ status: { ...s.status, updatePasswordPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ passwordPolicy: data.policy, status: { ...s.status, updatePasswordPolicy: ds() } }));
        return true;
      },

      deletePasswordPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, deletePasswordPolicy: { loading: true, error: null } } }));
        if (useMockStore.getState().isMockMode) {
          await new Promise((r) => setTimeout(r, 300));
          set((s) => ({ passwordPolicy: null, status: { ...s.status, deletePasswordPolicy: ds() } }));
          return true;
        }
        const { error } = await req(`${PROJ_API(projectId)}/password-policy`, { method: "DELETE" });
        if (error) { set((s) => ({ status: { ...s.status, deletePasswordPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ passwordPolicy: null, status: { ...s.status, deletePasswordPolicy: ds() } }));
        return true;
      },

      clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
      reset: () => set({ ...init }),
    }),
    { name: "PolicyStore" }
  )
);
