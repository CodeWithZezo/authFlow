// ==================== src/store/org.store.ts ====================
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import type { Org, OrgMembership, Role, CreateOrgPayload, UpdateOrgPayload, AddOrgMemberPayload, UpdateOrgMemberPayload } from "@/types";
import { useMockStore, shouldUseMock } from "./mock.store";
import {
  MOCK_ORGS, MOCK_ORG_MEMBERS, MOCK_USER_ORG_MEMBERSHIP,
} from "./mock.data";

interface SS { loading: boolean; error: string | null }
const ds = (): SS => ({ loading: false, error: null });

interface OrgState {
  orgs:            Org[];
  activeOrg:       Org | null;
  members:         OrgMembership[];
  userMembership:  OrgMembership | null;
  status: {
    fetchOrg: SS; createOrg: SS; updateOrg: SS;
    deleteOrg: SS; fetchMembers: SS; addMember: SS;
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

import { apiUrl } from "@/lib/config";

const BASE = apiUrl("/api/v1/organizations");
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
          if (useMockStore.getState().isMockMode) {
            const org = MOCK_ORGS.find((o) => o._id === orgId) ?? MOCK_ORGS[0];
            set((s) => ({
              activeOrg: org,
              orgs: s.orgs.some((o) => o._id === org._id) ? s.orgs : [...s.orgs, ...MOCK_ORGS],
              userMembership: MOCK_USER_ORG_MEMBERSHIP,
              status: { ...s.status, fetchOrg: ds() },
            }));
            return;
          }
          const { data, error } = await req<{ org: Org }>(`${BASE}/${orgId}`);
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            const org = MOCK_ORGS[0];
            set((s) => ({ activeOrg: org, orgs: MOCK_ORGS, userMembership: MOCK_USER_ORG_MEMBERSHIP, status: { ...s.status, fetchOrg: ds() } }));
            return;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchOrg: { loading: false, error } } })); return; }
          set((s) => ({
            activeOrg: data.org,
            orgs: s.orgs.some((o) => o._id === data.org._id) ? s.orgs.map((o) => o._id === data.org._id ? data.org : o) : [...s.orgs, data.org],
            status: { ...s.status, fetchOrg: ds() },
          }));
        },

        createOrg: async (payload) => {
          set((s) => ({ status: { ...s.status, createOrg: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 500));
            const newOrg: Org = { _id: `mock_org_${Date.now()}`, name: payload.name, slug: payload.slug, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            set((s) => ({ orgs: [...s.orgs, newOrg], activeOrg: newOrg, status: { ...s.status, createOrg: ds() } }));
            return newOrg;
          }
          const { data, error } = await req<{ org: Org }>(BASE, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, createOrg: { loading: false, error } } })); return null; }
          set((s) => ({ orgs: [...s.orgs, data.org], activeOrg: data.org, status: { ...s.status, createOrg: ds() } }));
          return data.org;
        },

        updateOrg: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, updateOrg: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({
              orgs: s.orgs.map((o) => o._id === orgId ? { ...o, ...payload } : o),
              activeOrg: s.activeOrg?._id === orgId ? { ...s.activeOrg, ...payload } : s.activeOrg,
              status: { ...s.status, updateOrg: ds() },
            }));
            return true;
          }
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
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({
              orgs: s.orgs.filter((o) => o._id !== orgId),
              activeOrg: s.activeOrg?._id === orgId ? null : s.activeOrg,
              status: { ...s.status, deleteOrg: ds() },
            }));
            return true;
          }
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
          if (useMockStore.getState().isMockMode) {
            set((s) => ({ members: MOCK_ORG_MEMBERS, status: { ...s.status, fetchMembers: ds() } }));
            return;
          }
          const { data, error } = await req<{ members: OrgMembership[] }>(`${BASE}/${orgId}/members`);
          if (shouldUseMock(error)) {
            useMockStore.getState().activateMock();
            set((s) => ({ members: MOCK_ORG_MEMBERS, status: { ...s.status, fetchMembers: ds() } }));
            return;
          }
          if (error || !data) { set((s) => ({ status: { ...s.status, fetchMembers: { loading: false, error } } })); return; }
          set((s) => ({ members: data.members, status: { ...s.status, fetchMembers: ds() } }));
        },

        addMember: async (orgId, payload) => {
          set((s) => ({ status: { ...s.status, addMember: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 400));
            set((s) => ({ status: { ...s.status, addMember: ds() } }));
            return true;
          }
          const { data, error } = await req<{ membership: OrgMembership }>(`${BASE}/${orgId}/members`, { method: "POST", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, addMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: [...s.members, data.membership], status: { ...s.status, addMember: ds() } }));
          return true;
        },

        updateMember: async (orgId, userId, payload) => {
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
          const { data, error } = await req<{ membership: OrgMembership }>(`${BASE}/${orgId}/members/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
          if (error || !data) { set((s) => ({ status: { ...s.status, updateMember: { loading: false, error } } })); return false; }
          set((s) => ({ members: s.members.map((m) => m._id === data.membership._id ? data.membership : m), status: { ...s.status, updateMember: ds() } }));
          return true;
        },

        removeMember: async (orgId, userId) => {
          set((s) => ({ status: { ...s.status, removeMember: { loading: true, error: null } } }));
          if (useMockStore.getState().isMockMode) {
            await new Promise((r) => setTimeout(r, 300));
            set((s) => ({
              members: s.members.filter((m) => { const uid = typeof m.userId === "string" ? m.userId : m.userId._id; return uid !== userId; }),
              status: { ...s.status, removeMember: ds() },
            }));
            return true;
          }
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
