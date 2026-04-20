// ==================== src/types/index.ts ====================

// ─── Enums (mirror backend) ───────────────────────────────────────────────────
export enum Role {
  OWNER       = "owner",
  ADMIN       = "admin",
  MEMBER      = "member",
  MANAGER     = "manager",
  CONTRIBUTOR = "contributor",
  VIEWER      = "viewer",
}

export enum Status {
  ACTIVE    = "active",
  INACTIVE  = "inactive",
  PENDING   = "pending",
  SUSPENDED = "suspended",
}

export enum AuthType {
  PASSWORD   = "password",
  OAUTH      = "oauth",
  TWO_FACTOR = "2fa",
}

export enum AuthMethod {
  EMAIL  = "email",
  PHONE  = "phone",
  GOOGLE = "google",
  GITHUB = "github",
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  isVerified?: boolean;
  avatarUrl?: string | null;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Organization ─────────────────────────────────────────────────────────────
export interface Org {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMembership {
  _id: string;
  userId: string | PopulatedUser;
  orgId: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrgPayload {
  name: string;
  slug: string;
}

export interface UpdateOrgPayload {
  name?: string;
  slug?: string;
}

export interface AddOrgMemberPayload {
  userId: string;
  role?: Role;
}

export interface UpdateOrgMemberPayload {
  role?: Role;
  status?: Status;
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  _id: string;
  name: string;
  organizationId: string;
  status: Status;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembership {
  _id: string;
  userId: string | PopulatedUser;
  projectId: string;
  role: Role;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: Status;
}

export interface AddProjectMemberPayload {
  userId: string;
  role: Role;
}

export interface UpdateProjectMemberPayload {
  role?: Role;
  status?: Status;
}

// ─── Policies ─────────────────────────────────────────────────────────────────
export interface ProjectPolicy {
  _id: string;
  projectId: string;
  phoneRequired: boolean;
  authRequired: boolean;
  authType: AuthType;
  roles: string[];
  statuses: string[];
  authMethods: AuthMethod[];
  passwordPolicyId: string | PasswordPolicy;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordPolicy {
  _id: string;
  projectId: string;
  minLength: number;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireSpecialChars: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPolicyPayload {
  phoneRequired?: boolean;
  authRequired?: boolean;
  authType?: AuthType;
  roles?: string[];
  statuses?: string[];
  authMethods?: AuthMethod[];
}

export interface CreatePasswordPolicyPayload {
  minLength?: number;
  requireNumbers?: boolean;
  requireUppercase?: boolean;
  requireSpecialChars?: boolean;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export interface Session {
  _id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface PopulatedUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
}

// Role arrays — matches updated backend pattern
export const ORG_ROLES_ADMIN: Role[]  = [Role.OWNER, Role.ADMIN];
export const ORG_ROLES_OWNER: Role[]  = [Role.OWNER];
export const ORG_ROLES_MEMBER: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER];

export const PROJ_ROLES_ADMIN: Role[]   = [Role.MANAGER];
export const PROJ_ROLES_MEMBER: Role[]  = [Role.MANAGER, Role.CONTRIBUTOR, Role.VIEWER];

// ─── API generic response ─────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: string[];
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
