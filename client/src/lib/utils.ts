// ==================== src/lib/utils.ts ====================
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role, Status } from "@/types";

// ─── Tailwind class merge ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

// ─── Role helpers ─────────────────────────────────────────────────────────────

// Org role hierarchy (higher index = more permissions)
const ORG_ROLE_RANK: Record<string, number> = {
  [Role.MEMBER]: 1,
  [Role.ADMIN]:  2,
  [Role.OWNER]:  3,
};

// Project role hierarchy
const PROJ_ROLE_RANK: Record<string, number> = {
  [Role.VIEWER]:      1,
  [Role.CONTRIBUTOR]: 2,
  [Role.MANAGER]:     3,
};

export function hasOrgRole(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  const userRank = ORG_ROLE_RANK[userRole] ?? 0;
  return requiredRoles.some((r) => (ORG_ROLE_RANK[r] ?? 0) <= userRank);
}

export function hasProjectRole(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  const userRank = PROJ_ROLE_RANK[userRole] ?? 0;
  return requiredRoles.some((r) => (PROJ_ROLE_RANK[r] ?? 0) <= userRank);
}

// ─── Status display ───────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  [Status.ACTIVE]:    { label: "Active",    color: "text-green-400 bg-green-400/10 border-green-400/20" },
  [Status.INACTIVE]:  { label: "Inactive",  color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
  [Status.PENDING]:   { label: "Pending",   color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  [Status.SUSPENDED]: { label: "Suspended", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export const ROLE_CONFIG: Record<Role, { label: string; color: string }> = {
  [Role.OWNER]:       { label: "Owner",       color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  [Role.ADMIN]:       { label: "Admin",       color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  [Role.MEMBER]:      { label: "Member",      color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  [Role.MANAGER]:     { label: "Manager",     color: "text-teal-400 bg-teal-400/10 border-teal-400/20" },
  [Role.CONTRIBUTOR]: { label: "Contributor", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  [Role.VIEWER]:      { label: "Viewer",      color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
};

// ─── Slug generator ───────────────────────────────────────────────────────────
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Initials ─────────────────────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Truncate ─────────────────────────────────────────────────────────────────
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
