// ==================== src/store/index.ts ====================
export { useAuthStore }    from "./auth.store";
export { useOrgStore }     from "./org.store";
export { useProjectStore } from "./project.store";
export { usePolicyStore }  from "./policy.store";
export { useSessionStore } from "./session.store";

import { useAuthStore }    from "./auth.store";
import { useOrgStore }     from "./org.store";
import { useProjectStore } from "./project.store";
import { usePolicyStore }  from "./policy.store";
import { useSessionStore } from "./session.store";

export function resetAllStores() {
  useAuthStore.getState().reset();
  useOrgStore.getState().reset();
  useProjectStore.getState().reset();
  usePolicyStore.getState().reset();
  useSessionStore.getState().reset();
  localStorage.removeItem("auth-store");
  localStorage.removeItem("org-store");
  localStorage.removeItem("project-store");
}
