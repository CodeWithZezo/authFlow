// tests/helpers/factories.ts
// Creates real Mongoose documents for use in integration and e2e tests.
// Each factory returns the saved document so _id is always populated.

import mongoose from "mongoose";
import { User }                    from "../../src/models/schema/user.schema";
import { Session }                 from "../../src/models/schema/session.schema";
import { Organization }            from "../../src/models/schema/org.schema";
import { OrganizationMembership }  from "../../src/models/schema/organizationMembership.schema";
import { Project }                 from "../../src/models/schema/project.schema";
import { ProjectMembership }       from "../../src/models/schema/projectMembership.schema";
import { PasswordPolicy }          from "../../src/models/schema/passwordPolicy.schema";
import { ProjectPolicy }           from "../../src/models/schema/projectPolicy.schema";
import { PasswordUtils }           from "../../src/utils/password.utils";
import { JWTUtils }                from "../../src/utils/jwt.utils";
import { Role, Status, AuthType, AuthMethod } from "../../src/models/enums";

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserFactoryInput {
  fullName?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  isVerified?: boolean;
}

export async function createUser(overrides: UserFactoryInput = {}) {
  const password = overrides.password ?? "TestPass1!";
  const passwordHash = await PasswordUtils.hash(password);

  const user = await User.create({
    fullName:   overrides.fullName   ?? "Test User",
    email:      overrides.email      ?? `user-${Date.now()}@example.com`,
    phone:      overrides.phone      ?? null,
    passwordHash,
    isVerified: overrides.isVerified ?? false,
  });

  return { user, plainPassword: password };
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function createSession(userId: mongoose.Types.ObjectId) {
  const payload = { userId: userId.toString(), email: "test@example.com" };
  const refreshToken = JWTUtils.generateRefreshToken(payload);
  const session = await Session.create({ userId, refreshToken });
  const accessToken = JWTUtils.generateAccessToken(payload);
  return { session, accessToken, refreshToken };
}

/** Returns a valid accessToken cookie string for use with supertest .set("Cookie", ...) */
export async function authCookiesForUser(userId: mongoose.Types.ObjectId, email: string) {
  const payload = { userId: userId.toString(), email };
  const accessToken = JWTUtils.generateAccessToken(payload);
  const refreshToken = JWTUtils.generateRefreshToken(payload);
  await Session.create({ userId, refreshToken });
  return {
    accessToken,
    refreshToken,
    cookieHeader: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
  };
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface OrgFactoryInput {
  name?: string;
  slug?: string;
  ownerUserId?: mongoose.Types.ObjectId;
}

export async function createOrg(overrides: OrgFactoryInput = {}) {
  const org = await Organization.create({
    name: overrides.name ?? "Test Org",
    slug: overrides.slug ?? `test-org-${Date.now()}`,
  });

  if (overrides.ownerUserId) {
    await OrganizationMembership.create({
      orgId:  org._id,
      userId: overrides.ownerUserId,
      role:   Role.OWNER,
      status: Status.ACTIVE,
    });
  }

  return org;
}

export async function addOrgMember(
  orgId:  mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  role:   Role   = Role.MEMBER,
  status: Status = Status.ACTIVE,
) {
  return OrganizationMembership.create({ orgId, userId, role, status });
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface ProjectFactoryInput {
  name?:           string;
  description?:    string;
  organizationId?: mongoose.Types.ObjectId;
  status?:         Status;
  managerUserId?:  mongoose.Types.ObjectId;
}

export async function createProject(overrides: ProjectFactoryInput = {}) {
  const project = await Project.create({
    name:           overrides.name           ?? "Test Project",
    description:    overrides.description    ?? null,
    organizationId: overrides.organizationId ?? new mongoose.Types.ObjectId(),
    status:         overrides.status         ?? Status.ACTIVE,
  });

  if (overrides.managerUserId) {
    await ProjectMembership.create({
      projectId: project._id,
      userId:    overrides.managerUserId,
      role:      Role.MANAGER,
      status:    Status.ACTIVE,
    });
  }

  return project;
}

export async function addProjectMember(
  projectId: mongoose.Types.ObjectId,
  userId:    mongoose.Types.ObjectId,
  role:      Role   = Role.VIEWER,
  status:    Status = Status.ACTIVE,
) {
  return ProjectMembership.create({ projectId, userId, role, status });
}

// ─── Password Policy ──────────────────────────────────────────────────────────

export async function createPasswordPolicy(
  projectId: mongoose.Types.ObjectId,
  overrides: Partial<{
    minLength:           number;
    requireNumbers:      boolean;
    requireUppercase:    boolean;
    requireSpecialChars: boolean;
  }> = {},
) {
  return PasswordPolicy.create({
    projectId,
    minLength:           overrides.minLength           ?? 8,
    requireNumbers:      overrides.requireNumbers      ?? true,
    requireUppercase:    overrides.requireUppercase    ?? true,
    requireSpecialChars: overrides.requireSpecialChars ?? false,
  });
}

// ─── Project Policy ───────────────────────────────────────────────────────────

export async function createProjectPolicy(
  projectId:        mongoose.Types.ObjectId,
  passwordPolicyId: mongoose.Types.ObjectId,
  overrides: Partial<{
    authRequired:  boolean;
    phoneRequired: boolean;
    authType:      AuthType;
    authMethods:   AuthMethod[];
    roles:         string[];
    statuses:      string[];
  }> = {},
) {
  return ProjectPolicy.create({
    projectId,
    passwordPolicyId,
    authRequired:  overrides.authRequired  ?? true,
    phoneRequired: overrides.phoneRequired ?? false,
    authType:      overrides.authType      ?? AuthType.PASSWORD,
    authMethods:   overrides.authMethods   ?? [AuthMethod.EMAIL],
    roles:         overrides.roles         ?? [],
    statuses:      overrides.statuses      ?? [Status.ACTIVE],
  });
}
