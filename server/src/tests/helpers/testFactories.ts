import mongoose from "mongoose";
import { User } from "../../app/models/schema/user.schema";
import { Session } from "../../app/models/schema/session.schema";
import { Organization } from "../../app/models/schema/org.schema";
import { OrganizationMembership } from "../../app/models/schema/organizationMembership.schema";
import { Project } from "../../app/models/schema/project.schema";
import { ProjectMembership } from "../../app/models/schema/projectMembership.schema";
import { PasswordPolicy } from "../../app/models/schema/passwordPolicy.schema";
import { ProjectPolicy } from "../../app/models/schema/projectPolicy.schema";
import { EndUser } from "../../app/models/schema/endUser.schema";
import { JWTUtils } from "../../app/utils/jwt.utils";
import { PasswordUtils } from "../../app/utils/password.utils";
import { Role, Status, AuthType, AuthMethod } from "../../app/models/enums";

// ─── User factory ─────────────────────────────────────────────────────────────
export const createTestUser = async (overrides: Partial<{
  fullName: string;
  email: string;
  password: string;
  isVerified: boolean;
  phone: string;
}> = {}) => {
  const password = overrides.password ?? "TestPass123";
  const passwordHash = await PasswordUtils.hash(password);

  const user = await User.create({
    fullName: overrides.fullName ?? "Test User",
    email: (overrides.email ?? `user_${Date.now()}@test.com`).toLowerCase(),
    passwordHash,
    phone: overrides.phone ?? null,
    isVerified: overrides.isVerified ?? false,
  });

  return { user, password };
};

// ─── Verified user + tokens + session ────────────────────────────────────────
export const createVerifiedUser = async (email?: string) => {
  const { user, password } = await createTestUser({
    email: email ?? `verified_${Date.now()}@test.com`,
    isVerified: true,
  });
  const accessToken = JWTUtils.generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });
  const refreshToken = JWTUtils.generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
  });
  await Session.create({ userId: user._id, refreshToken });
  return { user, password, accessToken, refreshToken };
};

// ─── Organization factory ─────────────────────────────────────────────────────
export const createTestOrg = async (userId: string, overrides: Partial<{
  name: string;
  slug: string;
}> = {}) => {
  const org = await Organization.create({
    name: overrides.name ?? "Test Org",
    slug: overrides.slug ?? `test-org-${Date.now()}`,
  });
  await OrganizationMembership.create({
    userId,
    orgId: org._id,
    role: Role.OWNER,
    status: Status.ACTIVE,
  });
  return org;
};

// ─── Project factory ──────────────────────────────────────────────────────────
export const createTestProject = async (orgId: string, userId: string, overrides: Partial<{
  name: string;
}> = {}) => {
  const project = await Project.create({
    name: overrides.name ?? `Test Project ${Date.now()}`,
    organizationId: orgId,
    status: Status.ACTIVE,
    description: "Test project",
  });
  await ProjectMembership.create({
    projectId: project._id,
    userId,
    role: Role.MANAGER,
    status: Status.ACTIVE,
  });
  return project;
};

// ─── Password policy factory ──────────────────────────────────────────────────
export const createTestPasswordPolicy = async (projectId: string) => {
  return PasswordPolicy.create({
    projectId,
    minLength: 6,
    requireNumbers: false,
    requireUppercase: false,
    requireSpecialChars: false,
  });
};

// ─── Project policy factory ───────────────────────────────────────────────────
export const createTestProjectPolicy = async (projectId: string, passwordPolicyId: string) => {
  return ProjectPolicy.create({
    projectId,
    passwordPolicyId,
    authRequired: true,
    authType: AuthType.PASSWORD,
    authMethods: [AuthMethod.EMAIL],
    phoneRequired: false,
    roles: ["user"],
    statuses: ["active"],
  });
};

// ─── End-user factory ─────────────────────────────────────────────────────────
// FIX: also creates a Session so logOutService can find and delete it.
export const createTestEndUser = async (projectId: string, overrides: Partial<{
  email: string;
  password: string;
  role: string;
  status: string;
}> = {}) => {
  const password = overrides.password ?? "endpass123";
  const passwordHash = await PasswordUtils.hash(password);
  const user = await User.create({
    fullName: "End User",
    email: overrides.email ?? `enduser_${Date.now()}@test.com`,
    passwordHash,
  });
  const endUser = await EndUser.create({
    userId: user._id,
    projectId,
    role: overrides.role ?? "user",
    status: overrides.status ?? "active",
  });
  const accessToken = JWTUtils.generateAccessToken({
    userId: user._id.toString(),
    email: user.email,
  });
  const refreshToken = JWTUtils.generateRefreshToken({
    userId: user._id.toString(),
    email: user.email,
  });
  // Create session so logout can find and delete it
  await Session.create({ userId: user._id, refreshToken });

  return { user, endUser, password, accessToken, refreshToken };
};

// ─── Cookie helper ────────────────────────────────────────────────────────────
export const makeCookie = (name: string, value: string) => `${name}=${value}`;

// ─── Valid MongoDB ObjectId ───────────────────────────────────────────────────
export const fakeId = () => new mongoose.Types.ObjectId().toString();