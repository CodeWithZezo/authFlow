// ==================== src/store/policy.store.ts ====================
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  ProjectPolicy, PasswordPolicy,
  CreateProjectPolicyPayload, CreatePasswordPolicyPayload,
} from "@/types";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface PolicyState {
  projectPolicy:   ProjectPolicy | null;
  passwordPolicy:  PasswordPolicy | null;

  status: {
    // project policy
    fetchProjectPolicy:   SS; createProjectPolicy:  SS;
    updateProjectPolicy:  SS; deleteProjectPolicy:  SS;
    // password policy
    fetchPasswordPolicy:  SS; createPasswordPolicy: SS;
    updatePasswordPolicy: SS; deletePasswordPolicy: SS;
  };

  // Project Policy
  fetchProjectPolicy:   (projectId: string) => Promise<void>;
  createProjectPolicy:  (projectId: string, p: CreateProjectPolicyPayload) => Promise<boolean>;
  updateProjectPolicy:  (projectId: string, p: Partial<CreateProjectPolicyPayload>) => Promise<boolean>;
  deleteProjectPolicy:  (projectId: string) => Promise<boolean>;

  // Password Policy
  fetchPasswordPolicy:  (projectId: string) => Promise<void>;
  createPasswordPolicy: (projectId: string, p: CreatePasswordPolicyPayload) => Promise<boolean>;
  updatePasswordPolicy: (projectId: string, p: Partial<CreatePasswordPolicyPayload>) => Promise<boolean>;
  deletePasswordPolicy: (projectId: string) => Promise<boolean>;

  clearError: (a: keyof PolicyState["status"]) => void;
  reset:      () => void;
}

const PROJ_API = (projectId: string) => `/api/v1/projects/${projectId}`;

async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res  = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json?.message ?? "Something went wrong" };
    return { data: json, error: null };
  } catch (e: unknown) { return { data: null, error: (e as Error).message }; }
}

const init = {
  projectPolicy: null,
  passwordPolicy: null,
  status: {
    fetchProjectPolicy:   ds(), createProjectPolicy:  ds(),
    updateProjectPolicy:  ds(), deleteProjectPolicy:  ds(),
    fetchPasswordPolicy:  ds(), createPasswordPolicy: ds(),
    updatePasswordPolicy: ds(), deletePasswordPolicy: ds(),
  },
};

export const usePolicyStore = create<PolicyState>()(
  devtools(
    (set) => ({
      ...init,

      // ── Project Policy ────────────────────────────────────────────────────
      fetchProjectPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, fetchProjectPolicy: { loading: true, error: null } } }));
        const { data, error } = await req<{ policy: ProjectPolicy }>(`${PROJ_API(projectId)}/policy`);
        if (error || !data) {
          // 404 = no policy yet — not an error for UI
          set((s) => ({ projectPolicy: null, status: { ...s.status, fetchProjectPolicy: ds() } }));
          return;
        }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, fetchProjectPolicy: ds() } }));
      },

      createProjectPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, createProjectPolicy: { loading: true, error: null } } }));
        const { data, error } = await req<{ policy: ProjectPolicy }>(
          `${PROJ_API(projectId)}/policy`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        if (error || !data) { set((s) => ({ status: { ...s.status, createProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, createProjectPolicy: ds() } }));
        return true;
      },

      updateProjectPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, updateProjectPolicy: { loading: true, error: null } } }));
        const { data, error } = await req<{ policy: ProjectPolicy }>(
          `${PROJ_API(projectId)}/policy`,
          { method: "PATCH", body: JSON.stringify(payload) }
        );
        if (error || !data) { set((s) => ({ status: { ...s.status, updateProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: data.policy, status: { ...s.status, updateProjectPolicy: ds() } }));
        return true;
      },

      deleteProjectPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, deleteProjectPolicy: { loading: true, error: null } } }));
        const { error } = await req(`${PROJ_API(projectId)}/policy`, { method: "DELETE" });
        if (error) { set((s) => ({ status: { ...s.status, deleteProjectPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ projectPolicy: null, status: { ...s.status, deleteProjectPolicy: ds() } }));
        return true;
      },

      // ── Password Policy ───────────────────────────────────────────────────
      fetchPasswordPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, fetchPasswordPolicy: { loading: true, error: null } } }));
        // Backend returns { passwordPolicy } not { policy }
        const { data, error } = await req<{ passwordPolicy: PasswordPolicy }>(`${PROJ_API(projectId)}/password-policy`);
        if (error || !data) {
          set((s) => ({ passwordPolicy: null, status: { ...s.status, fetchPasswordPolicy: ds() } }));
          return;
        }
        set((s) => ({ passwordPolicy: data.passwordPolicy, status: { ...s.status, fetchPasswordPolicy: ds() } }));
      },

      createPasswordPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, createPasswordPolicy: { loading: true, error: null } } }));
        const { data, error } = await req<{ passwordPolicy: PasswordPolicy }>(
          `${PROJ_API(projectId)}/password-policy`,
          { method: "POST", body: JSON.stringify(payload) }
        );
        if (error || !data) { set((s) => ({ status: { ...s.status, createPasswordPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ passwordPolicy: data.passwordPolicy, status: { ...s.status, createPasswordPolicy: ds() } }));
        return true;
      },

      updatePasswordPolicy: async (projectId, payload) => {
        set((s) => ({ status: { ...s.status, updatePasswordPolicy: { loading: true, error: null } } }));
        const { data, error } = await req<{ passwordPolicy: PasswordPolicy }>(
          `${PROJ_API(projectId)}/password-policy`,
          { method: "PATCH", body: JSON.stringify(payload) }
        );
        if (error || !data) { set((s) => ({ status: { ...s.status, updatePasswordPolicy: { loading: false, error } } })); return false; }
        set((s) => ({ passwordPolicy: data.passwordPolicy, status: { ...s.status, updatePasswordPolicy: ds() } }));
        return true;
      },

      deletePasswordPolicy: async (projectId) => {
        set((s) => ({ status: { ...s.status, deletePasswordPolicy: { loading: true, error: null } } }));
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
