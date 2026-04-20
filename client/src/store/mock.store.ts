// ==================== src/store/mock.store.ts ====================
// Tracks whether the app is running in mock/demo mode.
// Any store that gets a server error calls activateMock() here,
// which causes every subsequent data fetch to use mock data instead.

import { create } from "zustand";

interface MockState {
  isMockMode: boolean;
  activateMock: () => void;
  deactivateMock: () => void;
}

export const useMockStore = create<MockState>()((set) => ({
  isMockMode: false,
  activateMock:   () => set({ isMockMode: true }),
  deactivateMock: () => set({ isMockMode: false }),
}));

// Helper used by all stores — returns true if already in mock mode OR
// if the error looks like a server/network failure (not a 4xx user error).
export function shouldUseMock(error: string | null): boolean {
  if (useMockStore.getState().isMockMode) return true;
  if (!error) return false;
  const e = error.toLowerCase();
  if (e.includes("failed to fetch"))    return true;
  if (e.includes("network"))            return true;
  if (e.includes("networkerror"))       return true;
  if (e.includes("unexpected token"))   return true;
  if (e.includes("syntaxerror"))        return true;
  if (e.includes("json"))               return true;
  if (error.includes("502") || error.includes("503") || error.includes("504")) return true;
  if (error.includes("500") || e.includes("internal server")) return true;

  // ✅ ADD THIS: treat any server error (including misconfigured backend) as mock-worthy
  if (error.includes("503") || e.includes("service unavailable")) return true;
  if (e.includes("econnrefused") || e.includes("enotfound"))      return true;
  return false;
}

