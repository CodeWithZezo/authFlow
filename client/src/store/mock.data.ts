// ==================== src/store/mock.data.ts ====================
// Rich mock data — mirrors the exact shapes the backend returns.
// Used as fallback when the server is unreachable.

import { Role, Status, AuthType, AuthMethod } from "@/types";
import type {
  AuthUser, Org, OrgMembership, Project, ProjectMembership,
  ProjectPolicy, PasswordPolicy, Session, PopulatedUser,
} from "@/types";

// ─── Fixed IDs so cross-references work ──────────────────────────────────────
export const MOCK_USER_ID    = "mock_user_000000000001";
export const MOCK_ORG_1_ID   = "mock_org_0000000000001";
export const MOCK_ORG_2_ID   = "mock_org_0000000000002";
export const MOCK_PROJ_1_ID  = "mock_proj_000000000001";
export const MOCK_PROJ_2_ID  = "mock_proj_000000000002";
export const MOCK_PROJ_3_ID  = "mock_proj_000000000003";

// ─── Auth user ────────────────────────────────────────────────────────────────
export const MOCK_USER: AuthUser = {
  id:         MOCK_USER_ID,
  fullName:   "Alex Demo",
  email:      "alex@demo.authflow",
  phone:      "+1 555 000 1234",
  isVerified: true,
  avatarUrl:  null,
};

// ─── Populated user shape (for member lists) ─────────────────────────────────
const mkUser = (id: string, name: string, email: string): PopulatedUser => ({
  _id: id, fullName: name, email, isVerified: true,
});

export const MOCK_POPULATED_USERS: PopulatedUser[] = [
  mkUser(MOCK_USER_ID,              "Alex Demo",      "alex@demo.authflow"),
  mkUser("mock_user_000000000002",  "Jordan Smith",   "jordan@demo.authflow"),
  mkUser("mock_user_000000000003",  "Taylor Brooks",  "taylor@demo.authflow"),
  mkUser("mock_user_000000000004",  "Morgan Lee",     "morgan@demo.authflow"),
];

// ─── Organizations ────────────────────────────────────────────────────────────
export const MOCK_ORGS: Org[] = [
  {
    _id:       MOCK_ORG_1_ID,
    name:      "Acme Corp",
    slug:      "acme-corp",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-06-20T14:30:00.000Z",
  },
  {
    _id:       MOCK_ORG_2_ID,
    name:      "Startup Hub",
    slug:      "startup-hub",
    createdAt: "2024-03-10T09:00:00.000Z",
    updatedAt: "2024-07-05T11:00:00.000Z",
  },
];

// ─── Org memberships ──────────────────────────────────────────────────────────
export const MOCK_ORG_MEMBERS: OrgMembership[] = [
  {
    _id:       "mock_orgmem_00000001",
    userId:    MOCK_POPULATED_USERS[0],
    orgId:     MOCK_ORG_1_ID,
    role:      Role.OWNER,
    status:    Status.ACTIVE,
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    _id:       "mock_orgmem_00000002",
    userId:    MOCK_POPULATED_USERS[1],
    orgId:     MOCK_ORG_1_ID,
    role:      Role.ADMIN,
    status:    Status.ACTIVE,
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: "2024-02-01T08:00:00.000Z",
  },
  {
    _id:       "mock_orgmem_00000003",
    userId:    MOCK_POPULATED_USERS[2],
    orgId:     MOCK_ORG_1_ID,
    role:      Role.MEMBER,
    status:    Status.ACTIVE,
    createdAt: "2024-03-05T12:00:00.000Z",
    updatedAt: "2024-03-05T12:00:00.000Z",
  },
  {
    _id:       "mock_orgmem_00000004",
    userId:    MOCK_POPULATED_USERS[3],
    orgId:     MOCK_ORG_1_ID,
    role:      Role.MEMBER,
    status:    Status.INACTIVE,
    createdAt: "2024-04-10T15:00:00.000Z",
    updatedAt: "2024-05-01T09:00:00.000Z",
  },
];

export const MOCK_USER_ORG_MEMBERSHIP: OrgMembership = MOCK_ORG_MEMBERS[0];

// ─── Projects ─────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    _id:            MOCK_PROJ_1_ID,
    name:           "Consumer App",
    organizationId: MOCK_ORG_1_ID,
    status:         Status.ACTIVE,
    description:    "Main customer-facing authentication flow",
    createdAt:      "2024-02-01T10:00:00.000Z",
    updatedAt:      "2024-07-01T16:00:00.000Z",
  },
  {
    _id:            MOCK_PROJ_2_ID,
    name:           "Admin Portal",
    organizationId: MOCK_ORG_1_ID,
    status:         Status.ACTIVE,
    description:    "Internal admin dashboard login",
    createdAt:      "2024-03-15T09:00:00.000Z",
    updatedAt:      "2024-06-10T11:30:00.000Z",
  },
  {
    _id:            MOCK_PROJ_3_ID,
    name:           "Mobile SDK",
    organizationId: MOCK_ORG_1_ID,
    status:         Status.INACTIVE,
    description:    "SDK auth for iOS and Android",
    createdAt:      "2024-05-01T08:00:00.000Z",
    updatedAt:      "2024-05-20T14:00:00.000Z",
  },
];

// ─── Project memberships ──────────────────────────────────────────────────────
export const MOCK_PROJECT_MEMBERS: ProjectMembership[] = [
  {
    _id:       "mock_projmem_0000001",
    userId:    MOCK_POPULATED_USERS[0],
    projectId: MOCK_PROJ_1_ID,
    role:      Role.MANAGER,
    status:    Status.ACTIVE,
    createdAt: "2024-02-01T10:00:00.000Z",
    updatedAt: "2024-02-01T10:00:00.000Z",
  },
  {
    _id:       "mock_projmem_0000002",
    userId:    MOCK_POPULATED_USERS[1],
    projectId: MOCK_PROJ_1_ID,
    role:      Role.CONTRIBUTOR,
    status:    Status.ACTIVE,
    createdAt: "2024-02-10T09:00:00.000Z",
    updatedAt: "2024-02-10T09:00:00.000Z",
  },
  {
    _id:       "mock_projmem_0000003",
    userId:    MOCK_POPULATED_USERS[2],
    projectId: MOCK_PROJ_1_ID,
    role:      Role.VIEWER,
    status:    Status.ACTIVE,
    createdAt: "2024-03-01T11:00:00.000Z",
    updatedAt: "2024-03-01T11:00:00.000Z",
  },
];

export const MOCK_USER_PROJECT_MEMBERSHIP: ProjectMembership = MOCK_PROJECT_MEMBERS[0];

// ─── Policies ─────────────────────────────────────────────────────────────────
export const MOCK_PASSWORD_POLICY: PasswordPolicy = {
  _id:                "mock_pwpol_000000001",
  projectId:          MOCK_PROJ_1_ID,
  minLength:          8,
  requireNumbers:     true,
  requireUppercase:   true,
  requireSpecialChars: false,
  createdAt:          "2024-02-05T10:00:00.000Z",
  updatedAt:          "2024-06-01T12:00:00.000Z",
};

export const MOCK_PROJECT_POLICY: ProjectPolicy = {
  _id:              "mock_projpol_00000001",
  projectId:        MOCK_PROJ_1_ID,
  phoneRequired:    false,
  authRequired:     true,
  authType:         AuthType.PASSWORD,
  roles:            [Role.MEMBER, Role.VIEWER],
  statuses:         [Status.ACTIVE],
  authMethods:      [AuthMethod.EMAIL],
  passwordPolicyId: MOCK_PASSWORD_POLICY,
  createdAt:        "2024-02-05T10:00:00.000Z",
  updatedAt:        "2024-06-01T12:00:00.000Z",
};

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const MOCK_SESSIONS: Session[] = [
  {
    _id:       "mock_session_00000001",
    userId:    MOCK_USER_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),     // 5 min ago
    updatedAt: new Date(Date.now() - 1000 * 30).toISOString(),          // 30s ago
  },
  {
    _id:       "mock_session_00000002",
    userId:    MOCK_USER_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),     // 45m ago
  },
  {
    _id:       "mock_session_00000003",
    userId:    MOCK_USER_ID,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),  // 6h ago
  },
];

// ─── API endpoint ─────────────────────────────────────────────────────────────
import { apiUrl } from "@/lib/config";

export const MOCK_API_URL = apiUrl(`/api/v1/project/${MOCK_PROJ_1_ID}/end-users`);
