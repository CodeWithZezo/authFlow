// ==================== src/store/org.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type {
  Org, OrgMembership, Role,
  CreateOrgPayload, UpdateOrgPayload,
  AddOrgMemberPayload, UpdateOrgMemberPayload,
} from "@/types";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface OrgState {
  orgs:            Org[];
  activeOrg:       Org | null;
  members:         OrgMembership[];
  userMembership:  OrgMembership | null; // current user's membership in activeOrg
  status: {
    fetchOrg:     SS; createOrg:    SS; updateOrg:   SS;
    deleteOrg:    SS; fetchMembers: SS; addMember:   SS;
    updateMember: SS; removeMember: SS;
  };
  fetchOrg:      (orgId: string) => Promise<void>;
  createOrg:     (p: CreateOrgPayload) => Promise<Org | null>;
  updateOrg:     (orgId: string, p: UpdateOrgPayload) => Promise<boolean>;
  deleteOrg:     (orgId: string) => Promise<boolean>;
  setActiveOrg:  (org: Org | null) => void;
  fetchMembers:  (orgId: string) => Promise<void>;
  addMember:     (orgId: string, p: AddOrgMemberPayload) => Promise<boolean>;
  updateMember:  (orgId: string, userId: string, p: UpdateOrgMemberPayload) => Promise<boolean>;
  removeMember:  (orgId: string, userId: string) => Promise<boolean>;
  setUserMembership: (m: OrgMembership | null) => void;
  getUserRole:   () => Role | undefined;
  clearError:    (a: keyof OrgState["status"]) => void;
  reset:         () => void;
}

const BASE = "/api/v1/organizations";
async function req<T>(url: string, opts?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json?.message ?? "Something went wrong" };
    return { data: json, error: null };
  } catch (e: unknown) { return { data: null, error: (e as Error).message }; }
}

const init = {
  orgs: [], activeOrg: null, members: [], userMembership: null,
  status: { fetchOrg: ds(), createOrg: ds(), updateOrg: ds(), deleteOrg: ds(), fetchMembers: ds(), addMember: ds(), updateMember: ds(), removeMember: ds() },
};

export const useOrgStore = create<OrgState>()(
  devtools(
    persist(
      (set, get) => ({
        ...init,

        fetchOrg: async (orgId) => {
          set((s) => ({ status: { ...s.status, fetchOrg: { loading: true, error: null } } }));
          const { data, error } = await req<{ org: Org }>(`${BASE}/${orgId}`);
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchOrg: { loading: false, error } } })); return; }
          set((s) => ({
            activeOrg: data.org,
            orgs: s.orgs.some((o) => o._id === data.org._id) ? s.orgs.map((o) => o._id === data.org._id ? data.org : o) : [...s.orgs, data.org],
            status: { ...s.status, fetchOrg: ds() },
          }));
        },

        createOrg: async (payload) => {
          set((s) => ({ status: { ...s.status, createOrg: { loading: true, error: null } } }));
          const { data, error } = await req<{ org: Org }>(BASE, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, createOrg: { loading: false, error } } })); return null; }
          set((s) => ({ orgs: [...s.orgs, data.org], activeOrg: data.org, status: { ...s.status, createOrg: ds() } }));
          return data.org;
        },

        updateOrg: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, updateOrg: { loading: true, error: null } } }));
          const { data, error } = await req<{ org: Org }>(`${BASE}/${orgId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateOrg: { loading: false, error } } })); return false; }
          set((s) => ({
            orgs: s.orgs.map((o) => o._id === orgId ? data.org : o),
            activeOrg: s.activeOrg?._id === orgId ? data.org : s.activeOrg,
            status: { ...s.status, updateOrg: ds() },
          }));
          return true;
        },

        deleteOrg: async (orgId) => {
          set((s) => ({ status: { ...s.status, deleteOrg: { loading: true, error: null } } }));
          const { error } = await req(`${BASE}/${orgId}`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, deleteOrg: { loading: false, error } } })); return false; }
          set((s) => ({
            orgs: s.orgs.filter((o) => o._id !== orgId),
            activeOrg: s.activeOrg?._id === orgId ? null : s.activeOrg,
            members: s.activeOrg?._id === orgId ? [] : s.members,
            status: { ...s.status, deleteOrg: ds() },
          }));
          return true;
        },

        setActiveOrg: (org) => set({ activeOrg: org }),

        fetchMembers: async (orgId) => {
          set((s) => ({ status: { ...s.status, fetchMembers: { loading: true, error: null } } }));
          const { data, error } = await req<{ members: OrgMembership[] }>(`${BASE}/${orgId}/members`);
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchMembers: { loading: false, error } } })); return; }
          set((s) => ({ members: data.members, status: { ...s.status, fetchMembers: ds() } }));
        },

        addMember: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, addMember: { loading: true, error: null } } }));
          const { data, error } = await req<{ membership: OrgMembership }>(`${BASE}/${orgId}/members`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, addMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: [...s.members, data.membership], status: { ...s.status, addMember: ds() } }));
          return true;
        },

        updateMember: async (orgId, userId, payload) => {
          set((s) => ({ status: { ...s.status, updateMember: { loading: true, error: null } } }));
          const { data, error } = await req<{ membership: OrgMembership }>(`${BASE}/${orgId}/members/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: s.members.map((m) => m._id === data.membership._id ? data.membership : m), status: { ...s.status, updateMember: ds() } }));
          return true;
        },

        removeMember: async (orgId, userId) => {
          set((s) => ({ status: { ...s.status, removeMember: { loading: true, error: null } } }));
          const { error } = await req(`${BASE}/${orgId}/members/${userId}`, { method: "DELETE" });
          if (error) { set((s) => ({ status: { ...s.status, removeMember: { loading: false, error } } })); return false; }
          set((s) => ({
            members: s.members.filter((m) => { const uid = typeof m.userId === "string" ? m.userId : m.userId._id; return uid !== userId; }),
            status: { ...s.status, removeMember: ds() },
          }));
          return true;
        },

        setUserMembership: (m) => set({ userMembership: m }),
        getUserRole: () => get().userMembership?.role,
        clearError: (action) => set((s) => ({ status: { ...s.status, [action]: { ...s.status[action], error: null } } })),
        reset: () => set({ ...init }),
      }),
      { name: "org-store", partialize: (s) => ({ orgs: s.orgs, activeOrg: s.activeOrg }) }
    ),
    { name: "OrgStore" }
  )
);
