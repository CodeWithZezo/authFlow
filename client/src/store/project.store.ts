// ==================== src/store/project.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Project, ProjectMembership, Status, CreateProjectPayload, UpdateProjectPayload, AddProjectMemberPayload, UpdateProjectMemberPayload } from "@/types";
import { useMockStore, shouldUseMock } from "./mock.store";
import {
  MOCK_PROJECTS, MOCK_PROJECT_MEMBERS, MOCK_USER_PROJECT_MEMBERSHIP, MOCK_API_URL,
} from "./mock.data";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface ProjectState {
  projects:       Project[];
  activeProject:  Project | null;
  members:        ProjectMembership[];
  userMembership: ProjectMembership | null;
  status: {
    fetchProjects: SS; fetchProject: SS;
    createProject: SS; updateProject: SS; deleteProject: SS;
    fetchMembers:  SS; addMember:     SS;
    updateMember:  SS; removeMember:  SS;
    getApiKey:     SS;
  };
  fetchProjects:    (orgId: string) => Promise<void>;
  fetchProject:     (orgId: string, projectId: string) => Promise<void>;
  createProject:    (orgId: string, p: CreateProjectPayload) => Promise<Project | null>;
  updateProject:    (orgId: string, projectId: string, p: UpdateProjectPayload) => Promise<boolean>;
  deleteProject:    (orgId: string, projectId: string) => Promise<boolean>;
  setActiveProject: (p: Project | null) => void;
  fetchMembers:     (projectId: string) => Promise<void>;
  addMember:        (projectId: string, p: AddProjectMemberPayload) => Promise<boolean>;
  updateMember:     (projectId: string, userId: string, p: UpdateProjectMemberPayload) => Promise<boolean>;
  removeMember:     (projectId: string, userId: string) => Promise<boolean>;
  setUserMembership:(m: ProjectMembership | null) => void;
  getApiKey:        (projectId: string) => Promise<string | null>;
  clearError: (a: keyof ProjectState["status"]) => void;
  reset:      () => void;
}

import { apiUrl } from "@/lib/config";

const ORG_API  = (orgId: string)     => apiUrl(`/api/v1/organizations/${orgId}/projects`);
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
  projects: [], activeProject: null, members: [], userMembership: null,
  status: {
    fetchProjects: ds(), fetchProject: ds(), createProject: ds(),
    updateProject: ds(), deleteProject: ds(), fetchMembers: ds(),
    addMember: ds(), updateMember: ds(), removeMember: ds(), getApiKey: ds(),
  },
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...init,

        fetchProjects: async (orgId) => {
          set((s) => ({ status: { ...s.status, fetchProjects: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            set((s) => ({ projects: MOCK_PROJECTS, status: { ...s.status, fetchProjects: ds() } }));
            return;
          }
          const { data, error } = await req<{ projects: Project[] }>(ORG_API(orgId));
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ projects: MOCK_PROJECTS, status: { ...s.status, fetchProjects: ds() } }));
            return;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchProjects: { loading: false, error } } })); return; }
          set((s) => ({ projects: data.projects, status: { ...s.status, fetchProjects: ds() } }));
        },

        fetchProject: async (orgId, projectId) => {
          set((s) => ({ status: { ...s.status, fetchProject: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            const proj = MOCK_PROJECTS.find((p) => p._id === projectId) ?? MOCK_PROJECTS[0];
            set((s) => ({ activeProject: proj, userMembership: MOCK_USER_PROJECT_MEMBERSHIP, status: { ...s.status, fetchProject: ds() } }));
            return;
          }
          const { data, error } = await req<{ project: Project }>(`${ORG_API(orgId)}/${projectId}`);
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ activeProject: MOCK_PROJECTS[0], userMembership: MOCK_USER_PROJECT_MEMBERSHIP, status: { ...s.status, fetchProject: ds() } }));
            return;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchProject: { loading: false, error } } })); return; }
          set((s) => ({
            activeProject: data.project,
            projects: s.projects.some((p) => p._id === data.project._id) ? s.projects.map((p) => p._id === data.project._id ? data.project : p) : [...s.projects, data.project],
            status: { ...s.status, fetchProject: ds() },
          }));
        },

        createProject: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, createProject: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 500));
            const newProj: Project = { _id: `mock_proj_${Date.now()}`, name: payload.name, organizationId: orgId, status: "active" as Status, description: payload.description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            set((s) => ({ projects: [...s.projects, newProj], activeProject: newProj, status: { ...s.status, createProject: ds() } }));
            return newProj;
          }
          const { data, error } = await req<{ project: Project }>(ORG_API(orgId), { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, createProject: { loading: false, error } } })); return null; }
          set((s) => ({ projects: [...s.projects, data.project], activeProject: data.project, status: { ...s.status, createProject: ds() } }));
          return data.project;
        },

        updateProject: async (orgId, projectId, payload) => {
          set((s) => ({ status: { ...s.status, updateProject: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({
              projects: s.projects.map((p) => p._id === projectId ? { ...p, ...payload } : p),
              activeProject: s.activeProject?._id === projectId ? { ...s.activeProject, ...payload } : s.activeProject,
              status: { ...s.status, updateProject: ds() },
            }));
            return true;
          }
          const { data, error } = await req<{ project: Project }>(`${ORG_API(orgId)}/${projectId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateProject: { loading: false, error } } })); return false; }
          set((s) => ({
            projects: s.projects.map((p) => p._id === projectId ? data.project : p),
            activeProject: s.activeProject?._id === projectId ? data.project : s.activeProject,
            status: { ...s.status, updateProject: ds() },
          }));
          return true;
        },

        deleteProject: async (orgId, projectId) => {
          set((s) => ({ status: { ...s.status, deleteProject: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({
              projects: s.projects.filter((p) => p._id !== projectId),
              activeProject: s.activeProject?._id === projectId ? null : s.activeProject,
              status: { ...s.status, deleteProject: ds() },
            }));
            return true;
          }
          const { error } = await req(`${ORG_API(orgId)}/${projectId}`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, deleteProject: { loading: false, error } } })); return false; }
          set((s) => ({
            projects: s.projects.filter((p) => p._id !== projectId),
            activeProject: s.activeProject?._id === projectId ? null : s.activeProject,
            members: s.activeProject?._id === projectId ? [] : s.members,
            status: { ...s.status, deleteProject: ds() },
          }));
          return true;
        },

        setActiveProject: (p) => set({ activeProject: p }),

        fetchMembers: async (projectId) => {
          set((s) => ({ status: { ...s.status, fetchMembers: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            set((s) => ({ members: MOCK_PROJECT_MEMBERS, status: { ...s.status, fetchMembers: ds() } }));
            return;
          }
          const { data, error } = await req<{ members: ProjectMembership[] }>(`${PROJ_API(projectId)}/members`);
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ members: MOCK_PROJECT_MEMBERS, status: { ...s.status, fetchMembers: ds() } }));
            return;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchMembers: { loading: false, error } } })); return; }
          set((s) => ({ members: data.members, status: { ...s.status, fetchMembers: ds() } }));
        },

        addMember: async (projectId, payload) => {
          set((s) => ({ status: { ...s.status, addMember: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({ status: { ...s.status, addMember: ds() } }));
            return true;
          }
          const { data, error } = await req<{ membership: ProjectMembership }>(`${PROJ_API(projectId)}/members`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, addMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: [...s.members, data.membership], status: { ...s.status, addMember: ds() } }));
          return true;
        },

        updateMember: async (projectId, userId, payload) => {
          set((s) => ({ status: { ...s.status, updateMember: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 300));
            set((s) => ({
              members: s.members.map((m) => {
                const uid = typeof m.userId === "string" ? m.userId : m.userId._id;
                return uid === userId ? { ...m, ...payload } : m;
              }),
              status: { ...s.status, updateMember: ds() },
            }));
            return true;
          }
          const { data, error } = await req<{ membership: ProjectMembership }>(`${PROJ_API(projectId)}/members/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: s.members.map((m) => m._id === data.membership._id ? data.membership : m), status: { ...s.status, updateMember: ds() } }));
          return true;
        },

        removeMember: async (projectId, userId) => {
          set((s) => ({ status: { ...s.status, removeMember: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 300));
            set((s) => ({
              members: s.members.filter((m) => { const uid = typeof m.userId === "string" ? m.userId : m.userId._id; return uid !== userId; }),
              status: { ...s.status, removeMember: ds() },
            }));
            return true;
          }
          const { error } = await req(`${PROJ_API(projectId)}/members/${userId}`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, removeMember: { loading: false, error } } })); return false; }
          set((s) => ({
            members: s.members.filter((m) => { const uid = typeof m.userId === "string" ? m.userId : m.userId._id; return uid !== userId; }),
            status: { ...s.status, removeMember: ds() },
          }));
          return true;
        },

        setUserMembership: (m) => set({ userMembership: m }),

        getApiKey: async (projectId) => {
          set((s) => ({ status: { ...s.status, getApiKey: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({ status: { ...s.status, getApiKey: ds() } }));
            return MOCK_API_URL;
          }
          const { data, error } = await req<{ api: string }>(apiUrl(`/api/v1/projects/${projectId}/get-api`), { method: "POST" });
          if (error || !data) { set((s) => ({ status: { ...s.status, getApiKey: { loading: false, error } } })); return null; }
          set((s) => ({ status: { ...s.status, getApiKey: ds() } }));
          return data.api;
        },

        clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
        reset: () => set({ ...init }),
      }),
      { name: "project-store", partialize: (s) => ({ projects: s.projects, activeProject: s.activeProject }) }
    ),
    { name: "ProjectStore" }
  )
);
