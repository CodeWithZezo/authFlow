# Architecture

This document describes the internal structure of the AuthCore backend — how the code is organized, how a request flows through the system, how authentication and authorization work, and how the data models relate to each other.

---

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Request Lifecycle](#request-lifecycle)
- [Layer Responsibilities](#layer-responsibilities)
- [Authentication System](#authentication-system)
- [Authorization — RBAC](#authorization--rbac)
- [Data Models & Relationships](#data-models--relationships)
- [MongoDB Indexes](#mongodb-indexes)
- [Utilities](#utilities)
- [Error Classes](#error-classes)
- [Module Dependency Graph](#module-dependency-graph)

---

## Overview

AuthCore follows a **three-layer architecture** per module:

```
Route → Controller → Service
```

- **Route** — Declares HTTP methods, paths, and the middleware chain. No logic.
- **Controller** — Parses the HTTP request, calls the service, sends the HTTP response. No database access.
- **Service** — Contains all business logic and database queries. Returns `IServiceResponse<T>` — never touches `req` or `res`.

This separation means services are fully testable without an HTTP context, and controllers stay thin.

---

## Directory Structure

```
src/
├── config/
│   └── auth.config.ts          JWT secrets, token expiry, bcrypt salt rounds,
│                                password validation rules (minLength, requireUppercase,
│                                requireLowercase, requireNumbers, requireSpecialChars)
│
├── middleware/
│   └── auth.middleware.ts       authenticate()    — reads accessToken cookie, verifies JWT,
│                                                    attaches req.user = { userId, email }
│                                roleAuthorize()   — looks up membership, checks role hierarchy
│                                AuthRequest       — Express Request extended with req.user
│
├── models/
│   ├── enums.ts                 Role, Status, AuthType, AuthMethod
│   ├── models.types.ts          TypeScript interfaces for all Mongoose documents
│   └── schema/
│       ├── user.schema.ts
│       ├── session.schema.ts
│       ├── org.schema.ts
│       ├── organizationMembership.schema.ts
│       ├── project.schema.ts
│       ├── projectMembership.schema.ts
│       ├── projectPolicy.schema.ts
│       └── passwordPolicy.schema.ts
│
├── types/
│   └── auth.types.ts            IServiceResponse<T>, JWTPayload, AuthResponse,
│                                ILoginRequest, ISignupRequest
│
├── utils/
│   ├── jwt.utils.ts             JWTUtils — generateAccessToken, generateRefreshToken,
│   │                                       verifyAccessToken, verifyRefreshToken
│   ├── password.utils.ts        PasswordUtils — hash, compare, validate
│   ├── logger.ts                logger — info, error, warn, debug
│   └── user.utils.ts            Query helpers — findOrganizationsByUserId,
│                                checkOrganizationMembershipByUserIdAndOrgId,
│                                checkProjectMembershipByUserIdAndProjectId, ...
│
├── user/                        Auth + User module
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.route.ts
│
├── org/                         Organization + Org Members module
│   ├── org.controller.ts
│   ├── org.service.ts
│   └── org.route.ts
│
├── project/                     Project + Project Members module
│   ├── project.controller.ts
│   ├── project.service.ts
│   └── project.route.ts
│
├── projectPolicy/               Project Policy module
│   ├── projectPolicy.controller.ts
│   ├── projectPolicy.service.ts
│   └── projectPolicy.route.ts
│
├── passwordPolicy/              Password Policy module
│   ├── passwordPolicy.controller.ts
│   ├── passwordPolicy.service.ts
│   └── passwordPolicy.route.ts
│
├── session/                     Session management module
│   ├── session.controller.ts
│   ├── session.service.ts
│   └── session.route.ts
│
├── index.route.ts               Root router — mounts all sub-routers
└── index.ts                     Express app entry point — DB connection, global middleware
```

---

## Request Lifecycle

```
HTTP Request
    │
    ▼
Express App (index.ts)
    │  global middleware: express.json(), cors, cookieParser (root level)
    ▼
index.route.ts  →  /api/v1/*
    │
    ▼
Module Router (e.g. org.route.ts)
    │  cookieParser() — ensures cookies are parsed per-router
    │  authenticate() — reads req.cookies.accessToken
    │                   verifies JWT via JWTUtils.verifyAccessToken()
    │                   attaches req.user = { userId, email }
    │  roleAuthorize(requiredRole, type)
    │                   looks up membership via user.utils.ts
    │                   checks role against hierarchy
    ▼
Controller method  (e.g. OrgController.updateOrg)
    │  destructure: const { name, slug } = req.body
    │  extract:     const { orgId } = req.params
    │  extract:     const { userId } = req.user!
    │  call:        const { status, body } = await this.orgService.updateOrg(orgId, data)
    ▼
Service method  (e.g. OrgService.updateOrg)
    │  validate inputs
    │  query MongoDB via Mongoose
    │  return { status: 200, body: { message, org } }
    ▼
Controller  →  res.status(status).json(body)
    ▼
HTTP Response
```

---

## Layer Responsibilities

### Route layer

- Declares the HTTP verb and path
- Applies `cookieParser()` (each router applies it independently)
- Chains `authenticate` and `roleAuthorize` middleware
- Instantiates the controller once: `const controller = new XController()`
- No conditional logic

### Controller layer

- Arrow function methods bound to the class instance (avoids `this` binding issues)
- Wraps everything in `try/catch` — returns `500` on uncaught exceptions
- For auth endpoints that return tokens: strips `accessToken` and `refreshToken` from the response body and sets them as HTTP-only cookies via `setTokenCookies()`
- Never accesses the database directly

```typescript
// Cookie configuration (from UserController.setTokenCookies)
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",  // HTTPS only in prod
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,         // 15 minutes
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### Service layer

- Receives plain data arguments (never `req` or `res`, except where legacy code passes `req` for cookie reading — this should be refactored)
- Returns `IServiceResponse<T>` — always `{ status: number, body: T }`
- Catches MongoDB error code `11000` → returns `409`
- Logs errors with `logger.error("ClassName.methodName", error)`
- Never throws — all errors are caught and mapped to response objects

---

## Authentication System

### Token pair

| Token         | Algorithm | Secret env var             | Expiry | Storage          |
|---------------|-----------|----------------------------|--------|------------------|
| Access Token  | HS256     | `JWT_ACCESS_SECRET`        | 15 min | HTTP-only cookie |
| Refresh Token | HS256     | `JWT_REFRESH_SECRET`       | 7 days | HTTP-only cookie + MongoDB Session |

### JWT Payload

```typescript
interface JWTPayload {
  userId: string;   // MongoDB ObjectId as string
  email:  string;
}
```

### Session model

Every login creates a `Session` document. The refresh token is stored hashed/raw in the session and compared on refresh. Sessions are deleted on logout and when all sessions are revoked.

```
Session {
  userId:       ObjectId → User
  refreshToken: string              (select: false — never returned in API)
  createdAt, updatedAt
}
```

Composite unique index on `{ userId, refreshToken }` prevents duplicate sessions.

### Token refresh flow

```
Client sends refreshToken cookie
    ↓
Service reads cookie from req
    ↓
Verifies JWT signature with JWT_REFRESH_SECRET
    ↓
Looks up Session where { userId, refreshToken } match
    ↓
Deletes old session
    ↓
Creates new Session with new refreshToken
    ↓
Issues new accessToken + refreshToken cookies
```

### Cookie security

- `httpOnly: true` — not accessible to JavaScript
- `secure: true` in production — HTTPS only
- `sameSite: "strict"` — no cross-site requests

---

## Authorization — RBAC

### Organization role hierarchy

```
owner  (level 3 — highest)
admin  (level 2)
member (level 1 — lowest)
```

### Project role hierarchy

```
manager     (level 3 — highest)
contributor (level 2)
viewer      (level 1 — lowest)
```

The `roleAuthorize(requiredRole, type)` middleware resolves the calling user's membership then checks their role. Specifying `"member"` allows members, admins, and owners. Specifying `"admin"` blocks plain members.

**Both hierarchies are defined in the same `Role` enum:**

```typescript
enum Role {
  OWNER       = "owner",       // org only
  ADMIN       = "admin",       // org only
  MEMBER      = "member",      // org only
  MANAGER     = "manager",     // project only
  CONTRIBUTOR = "contributor", // project only
  VIEWER      = "viewer",      // project only / end users
}
```

### Role requirements per endpoint

| Endpoint type                         | Min org role | Min project role |
|---------------------------------------|:------------:|:----------------:|
| Read org / project / members          | member       | viewer           |
| Create project, update org/project    | admin        | —                |
| Add / update / remove members         | admin        | manager          |
| Delete org / project                  | owner        | —                |
| Create / update policy                | —            | manager          |
| Delete policy                         | —            | manager          |

---

## Data Models & Relationships

```
User
 │
 ├──< OrganizationMembership >── Organization
 │         role: owner|admin|member
 │         status: active|inactive|pending|suspended
 │
 └──< ProjectMembership >── Project ──> Organization
           role: manager|contributor|viewer
           status: active|inactive|pending|suspended

Project
 ├──── PasswordPolicy   (one-to-one, unique projectId)
 └──── ProjectPolicy    (one-to-one, unique projectId)
           └──> PasswordPolicy (required reference)

User
 └──< Session            (one-to-many, one per login)
```

### Cascade behavior

| Delete action            | Cascade effect                                          |
|--------------------------|---------------------------------------------------------|
| Delete Organization      | Deletes all OrganizationMemberships for that org        |
| Delete Project           | Deletes all ProjectMemberships for that project         |
| Delete PasswordPolicy    | **Blocked** if a ProjectPolicy references it            |

---

## MongoDB Indexes

| Collection               | Index                                        | Type   | Purpose                          |
|--------------------------|----------------------------------------------|--------|----------------------------------|
| `users`                  | `{ email: 1 }`                               | Unique | Prevent duplicate accounts       |
| `sessions`               | `{ userId: 1 }`                              | Normal | Fast lookup by user              |
| `sessions`               | `{ refreshToken: 1 }`                        | Normal | Fast lookup by token             |
| `sessions`               | `{ userId: 1, refreshToken: 1 }`             | Unique | Prevent duplicate sessions       |
| `organizations`          | `{ slug: 1 }`                                | Unique | Slug uniqueness                  |
| `organizationmemberships`| `{ userId: 1, orgId: 1 }`                    | Unique | One membership per user per org  |
| `projects`               | `{ name: 1, organizationId: 1 }`             | Unique | Unique project name within org   |
| `projectmemberships`     | `{ userId: 1, projectId: 1 }`                | Unique | One membership per user/project  |
| `projectpolicies`        | `{ projectId: 1 }`                           | Unique | One policy per project           |
| `passwordpolicies`       | `{ projectId: 1 }`                           | Unique | One policy per project           |

---

## Utilities

### `JWTUtils`

```typescript
JWTUtils.generateAccessToken(payload)   // signs with JWT_ACCESS_SECRET, expiry from config
JWTUtils.generateRefreshToken(payload)  // signs with JWT_REFRESH_SECRET, expiry from config
JWTUtils.verifyAccessToken(token)       // throws on invalid/expired
JWTUtils.verifyRefreshToken(token)      // throws on invalid/expired
```

### `PasswordUtils`

```typescript
PasswordUtils.hash(password)            // bcrypt.hash with saltRounds from config
PasswordUtils.compare(password, hash)   // bcrypt.compare
PasswordUtils.validate(password)        // checks against auth.config.password rules
                                        // returns { valid: boolean, errors: string[] }
```

Validation rules from `auth.config.ts`: `minLength`, `requireUppercase`, `requireLowercase`, `requireNumbers`, `requireSpecialChars`.

### `logger`

```typescript
logger.info("message", meta?)   // [INFO]  timestamp - message meta
logger.error("message", error?) // [ERROR] timestamp - message error
logger.warn("message", meta?)   // [WARN]  timestamp - message meta
logger.debug("message", meta?)  // [DEBUG] — only in NODE_ENV=development
```

### `user.utils.ts` — Membership helpers

```typescript
findOrganizationsByUserId(userId)                             // all orgs for a user
findOrganizationByUserId(userId, orgId)                       // specific org membership
checkOrganizationMembershipByUserIdAndOrgId(userId, orgId)    // used by roleAuthorize
checkProjectMembershipByUserIdAndProjectId(userId, projectId) // used by roleAuthorize
findProjectMembershipByUserId(userId, projectId)
```

> **Note:** `findProjectsByUserId` contains a known bug — it queries the `Organization` model instead of `Project`.

---

## Error Classes

Defined in `src/utils/errors.ts` but not yet used in service layer (services currently return inline error objects):

```typescript
AppError         (message, statusCode, code?)   // base class
ValidationError  extends AppError               // 400, VALIDATION_ERROR
UnauthorizedError extends AppError              // 401, UNAUTHORIZED
ForbiddenError   extends AppError               // 403, FORBIDDEN
NotFoundError    extends AppError               // 404, NOT_FOUND
ConflictError    extends AppError               // 409, CONFLICT
```

Future refactoring should migrate services to throw these and add a global Express error handler.

---

## Module Dependency Graph

```
index.ts
    └── index.route.ts
            ├── user.route.ts
            │       └── user.controller.ts → user.service.ts
            │                                    ├── User (schema)
            │                                    ├── Session (schema)
            │                                    ├── JWTUtils
            │                                    └── PasswordUtils
            │
            ├── org.route.ts
            │       └── org.controller.ts → org.service.ts
            │                                   ├── Organization (schema)
            │                                   └── OrganizationMembership (schema)
            │
            ├── project.route.ts  (mounted under org router as /:orgId/projects)
            │       └── project.controller.ts → project.service.ts
            │                                       ├── Project (schema)
            │                                       ├── ProjectMembership (schema)
            │                                       └── Organization (schema)
            │
            ├── projectPolicy.route.ts
            │       └── projectPolicy.controller.ts → projectPolicy.service.ts
            │                                             ├── ProjectPolicy (schema)
            │                                             └── PasswordPolicy (schema)
            │
            ├── passwordPolicy.route.ts
            │       └── passwordPolicy.controller.ts → passwordPolicy.service.ts
            │                                              ├── PasswordPolicy (schema)
            │                                              └── ProjectPolicy (schema)
            │
            └── session.route.ts
                    └── session.controller.ts → session.service.ts
                                                    └── Session (schema)

All routes use:
    auth.middleware.ts → JWTUtils, user.utils.ts
```
