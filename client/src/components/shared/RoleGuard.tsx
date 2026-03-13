// ==================== src/components/shared/RoleGuard.tsx ====================
import type { ReactNode } from "react";
import type { Role } from "@/types";
import { useOrgStore } from "@/store";
import { hasOrgRole } from "@/lib/utils";

interface RoleGuardProps {
  requiredRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Hides children if current user's org role doesn't satisfy requiredRoles.
 * Usage: <RoleGuard requiredRoles={["owner", "admin"]}><DeleteButton /></RoleGuard>
 */
export function RoleGuard({ requiredRoles, children, fallback = null }: RoleGuardProps) {
  const userRole = useOrgStore((s) => s.userMembership?.role);
  const allowed = hasOrgRole(userRole, requiredRoles);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
