// ==================== src/store/project.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type {
  Project, ProjectMembership, Role, Status,
  CreateProjectPayload, UpdateProjectPayload,
  AddProjectMemberPayload, UpdateProjectMemberPayload,
} from "@/types";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface ProjectState {
  projects:        Project[];
  activeProject:   Project | null;
  members:         ProjectMembership[];
  userMembership:  ProjectMembership | null;

  status: {
    fetchProjects:  SS; fetchProject:  SS;
    createProject:  SS; updateProject: SS; deleteProject: SS;
    fetchMembers:   SS; addMember:     SS;
    updateMember:   SS; removeMember:  SS;
  };

  fetchProjects:    (orgId: string) => Promise<void>;
  fetchProject:     (orgId: string, projectId: string) => Promise<void>;
  createProject:    (orgId: string, p: CreateProjectPayload) => Promise<Project | null>;
  updateProject:    (orgId: string, projectId: string, p: UpdateProjectPayload) => Promise<boolean>;
  deleteProject:    (orgId: string, projectId: string) => Promise<boolean>;
  setActiveProject: (p: Project | null) => void;

  fetchMembers:   (projectId: string) => Promise<void>;
  addMember:      (projectId: string, p: AddProjectMemberPayload) => Promise<boolean>;
  updateMember:   (projectId: string, userId: string, p: UpdateProjectMemberPayload) => Promise<boolean>;
  removeMember:   (projectId: string, userId: string) => Promise<boolean>;
  setUserMembership: (m: ProjectMembership | null) => void;

  clearError: (a: keyof ProjectState["status"]) => void;
  reset:      () => void;
}

const ORG_API  = (orgId: string)     => `/api/v1/organizations/${orgId}/projects`;
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
  projects: [], activeProject: null, members: [], userMembership: null,
  status: {
    fetchProjects: ds(), fetchProject: ds(), createProject: ds(),
    updateProject: ds(), deleteProject: ds(), fetchMembers:  ds(),
    addMember:     ds(), updateMember:  ds(), removeMember:  ds(),
  },
};

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        ...init,

        fetchProjects: async (orgId) => {
          set((s) => ({ status: { ...s.status, fetchProjects: { loading: true, error: null } } }));
          const { data, error } = await req<{ projects: Project[] }>(ORG_API(orgId));
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchProjects: { loading: false, error } } })); return; }
          set((s) => ({ projects: data.projects, status: { ...s.status, fetchProjects: ds() } }));
        },

        fetchProject: async (orgId, projectId) => {
          set((s) => ({ status: { ...s.status, fetchProject: { loading: true, error: null } } }));
          const { data, error } = await req<{ project: Project }>(`${ORG_API(orgId)}/${projectId}`);
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchProject: { loading: false, error } } })); return; }
          set((s) => ({
            activeProject: data.project,
            projects: s.projects.some((p) => p._id === data.project._id)
              ? s.projects.map((p) => p._id === data.project._id ? data.project : p)
              : [...s.projects, data.project],
            status: { ...s.status, fetchProject: ds() },
          }));
        },

        createProject: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, createProject: { loading: true, error: null } } }));
          const { data, error } = await req<{ project: Project }>(ORG_API(orgId), { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, createProject: { loading: false, error } } })); return null; }
          set((s) => ({ projects: [...s.projects, data.project], activeProject: data.project, status: { ...s.status, createProject: ds() } }));
          return data.project;
        },

        updateProject: async (orgId, projectId, payload) => {
          set((s) => ({ status: { ...s.status, updateProject: { loading: true, error: null } } }));
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
          const { data, error } = await req<{ members: ProjectMembership[] }>(`${PROJ_API(projectId)}/members`);
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchMembers: { loading: false, error } } })); return; }
          set((s) => ({ members: data.members, status: { ...s.status, fetchMembers: ds() } }));
        },

        addMember: async (projectId, payload) => {
          set((s) => ({ status: { ...s.status, addMember: { loading: true, error: null } } }));
          const { data, error } = await req<{ membership: ProjectMembership }>(`${PROJ_API(projectId)}/members`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, addMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: [...s.members, data.membership], status: { ...s.status, addMember: ds() } }));
          return true;
        },

        updateMember: async (projectId, userId, payload) => {
          set((s) => ({ status: { ...s.status, updateMember: { loading: true, error: null } } }));
          const { data, error } = await req<{ membership: ProjectMembership }>(`${PROJ_API(projectId)}/members/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: s.members.map((m) => m._id === data.membership._id ? data.membership : m), status: { ...s.status, updateMember: ds() } }));
          return true;
        },

        removeMember: async (projectId, userId) => {
          set((s) => ({ status: { ...s.status, removeMember: { loading: true, error: null } } }));
          const { error } = await req(`${PROJ_API(projectId)}/members/${userId}`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, removeMember: { loading: false, error } } })); return false; }
          set((s) => ({
            members: s.members.filter((m) => {
              const uid = typeof m.userId === "string" ? m.userId : m.userId._id;
              return uid !== userId;
            }),
            status: { ...s.status, removeMember: ds() },
          }));
          return true;
        },

        setUserMembership: (m) => set({ userMembership: m }),
        clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
        reset: () => set({ ...init }),
      }),
      { name: "project-store", partialize: (s) => ({ projects: s.projects, activeProject: s.activeProject }) }
    ),
    { name: "ProjectStore" }
  )
);
