// src/store/org.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const initialState = {
  orgs: [],
  currentOrg: null,
  isLoading: false,
  error: null,
};

export const useOrgStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // ==================== Get All Orgs ====================
      getAllOrgs: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/orgs/get-all-org");
          
          // The response contains organization memberships with populated orgId
          set({
            orgs: res.data || [],
            isLoading: false,
          });

          return res.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to fetch organizations";
          set({
            error: errorMessage,
            isLoading: false,
            orgs: [],
          });
          throw new Error(errorMessage);
        }
      },

      // ==================== Create Org ====================
      createOrg: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const res = await api.post("/orgs/create-org", data);

          // After creating org, fetch all orgs to get the complete membership data
          await get().getAllOrgs();

          set({ isLoading: false });

          return res.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to create organization";
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // ==================== Set Current Org ====================
      setCurrentOrg: (org) => {
        set({ currentOrg: org });
        
        // Optionally store in localStorage for persistence
        if (org) {
          localStorage.setItem('currentOrg', JSON.stringify(org));
        } else {
          localStorage.removeItem('currentOrg');
        }
      },

      // ==================== Get Current Org from localStorage ====================
      loadCurrentOrg: () => {
        try {
          const stored = localStorage.getItem('currentOrg');
          if (stored) {
            set({ currentOrg: JSON.parse(stored) });
          }
        } catch (error) {
          console.error('Failed to load current org from localStorage:', error);
        }
      },

      // ==================== Clear Error ====================
      clearError: () => {
        set({ error: null });
      },

      // ==================== Reset ====================
      reset: () => {
        set(initialState);
        localStorage.removeItem('currentOrg');
      },
    }),
    { name: "OrgStore" }
  )
);

// ==================== Selectors ====================
export const useOrgs = () => useOrgStore((s) => s.orgs);
export const useCurrentOrg = () => useOrgStore((s) => s.currentOrg);
export const useOrgLoading = () => useOrgStore((s) => s.isLoading);
export const useOrgError = () => useOrgStore((s) => s.error);