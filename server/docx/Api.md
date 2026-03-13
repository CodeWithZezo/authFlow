# Backend API Documentation

> **Base URL:** `http://localhost:5000/api/v1`
> **Auth:** HTTP-only cookies (`accessToken` · `refreshToken`)
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Enums Reference](#enums-reference)
5. [Auth / User](#auth--user)
6. [Organizations](#organizations)
7. [Organization Members](#organization-members)
8. [Projects](#projects)
9. [Project Members](#project-members)
10. [Project Policy](#project-policy)
11. [Password Policy](#password-policy)
12. [Sessions](#sessions)

---

## Overview

### Response Envelope

Every endpoint returns the same wrapper shape:

```json
{
  "message": "Human readable result",
  "data_key": { }
}
```

Error responses:

```json
{
  "message": "What went wrong",
  "errors": ["field-level detail (optional)"]
}
```

### Auth Flow

Tokens are **never returned in the response body** — they are set as `httpOnly` cookies automatically on `signup`, `login`, and `refresh-token`. Your client just needs `credentials: "include"` on every request.

```
Cookie: accessToken   → expires in 15 minutes
Cookie: refreshToken  → expires in 7 days
```

### Creation Order (required)

Some resources depend on others existing first:

```
Organization
  └── Project
        ├── Password Policy   ← must exist BEFORE project policy
        └── Project Policy    ← auto-links passwordPolicyId
```

---

## Error Handling

| Status | Meaning |
|--------|---------|
| `400` | Validation error / bad request |
| `401` | Not authenticated / invalid or missing token |
| `403` | Authenticated but not authorized (wrong role) |
| `404` | Resource not found |
| `409` | Conflict — duplicate (email, slug, membership) |
| `500` | Internal server error |

---

## Enums Reference

```ts
enum Role    { OWNER, ADMIN, MEMBER, MANAGER, CONTRIBUTOR, VIEWER }
enum Status  { ACTIVE, INACTIVE, PENDING, SUSPENDED }
enum AuthType   { PASSWORD, OAUTH, TWO_FACTOR }
enum AuthMethod { EMAIL, PHONE, GOOGLE, GITHUB }
```

---

## Auth / User

### POST `/auth/signup`

Register a new user. Sets `accessToken` and `refreshToken` cookies on success.

**Auth:** Public

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `fullName` | `string` | ✅ | max 100 chars |
| `email` | `string` | ✅ | lowercased, unique |
| `password` | `string` | ✅ | validated by `PasswordUtils` |
| `phone` | `string` | ❌ | E.164 format |

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Secret123",
  "phone": "+1234567890"
}
```

**Response `201`**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Invalid password` + `errors[]` |
| `400` | `Email already exists` |

---

### POST `/auth/login`

Login with email and password. Sets auth cookies on success.

**Auth:** Public

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| `email` | `string` | ✅ |
| `password` | `string` | ✅ |

```json
{
  "email": "john@example.com",
  "password": "Secret123"
}
```

**Response `200`**

```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `404` | `User not found` |
| `401` | `Invalid credentials` |

---

### GET `/auth/me`

Get the currently authenticated user's profile. Excludes `passwordHash` and `privateMetadata`.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "User fetched successfully",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isVerified": false,
    "publicMetadata": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST `/auth/refresh-token`

Rotate the access and refresh tokens. Validates refresh token from cookie against DB session (prevents reuse of revoked tokens). Deletes old session, creates new one.

**Auth:** Public (reads `refreshToken` cookie)

**Response `200`**

```json
{
  "message": "Token refreshed successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `401` | `Refresh token missing` |
| `401` | `Invalid or expired refresh token` |
| `401` | `Session not found or already revoked` |
| `404` | `User not found` |

---

### POST `/auth/logout`

Deletes the current session from the DB and clears both cookies.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "Logged out successfully"
}
```

---

### PATCH `/auth/change-password`

Change the authenticated user's password.

**Auth:** 🔵 JWT

**Request Body**

| Field | Type | Required |
|-------|------|----------|
| `currentPassword` | `string` | ✅ |
| `newPassword` | `string` | ✅ |

```json
{
  "currentPassword": "OldSecret123",
  "newPassword": "NewSecret456!"
}
```

**Response `200`**

```json
{
  "message": "Password changed successfully"
}
```

---

## Organizations

### POST `/organizations`

Create a new organization. The creator is automatically assigned as `owner`.

**Auth:** 🔵 JWT

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | ✅ | max 100 chars |
| `slug` | `string` | ✅ | lowercase, unique, `^[a-z0-9]+(?:-[a-z0-9]+)*$` |

```json
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}
```

**Response `201`**

```json
{
  "message": "Organization created successfully",
  "org": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Name and slug are required` |
| `409` | `Organization slug already exists` |

---

### GET `/organizations/:orgId`

Get organization details. Caller must be a member.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "Organization fetched successfully",
  "org": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `403` | `You are not a member of this organization` |
| `404` | `Organization not found` |

---

### PATCH `/organizations/:orgId`

Update organization name or slug.

**Auth:** 🟣 JWT + Role (`admin`)

**Request Body** _(all optional)_

```json
{
  "name": "Acme Corp Ltd",
  "slug": "acme-corp-ltd"
}
```

**Response `200`**

```json
{
  "message": "Organization updated successfully",
  "org": { "_id": "...", "name": "Acme Corp Ltd", "slug": "acme-corp-ltd" }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `404` | `Organization not found` |
| `409` | `Organization slug already exists` |

---

### DELETE `/organizations/:orgId`

Delete the organization and cascade-delete all memberships.

**Auth:** 🟣 JWT + Role (`owner`)

**Response `200`**

```json
{
  "message": "Organization deleted successfully"
}
```

---

## Organization Members

### GET `/organizations/:orgId/members`

List all members of the organization. `userId` is populated with `fullName`, `email`, `phone`, `isVerified`.

**Auth:** 🟣 JWT + Role (`member`)

**Response `200`**

```json
{
  "message": "Members fetched successfully",
  "members": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "userId": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "isVerified": false
      },
      "orgId": "64f1a2b3c4d5e6f7a8b9c0d2",
      "role": "owner",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/organizations/:orgId/members`

Add a user to the organization.

**Auth:** 🟣 JWT + Role (`admin`)

**Request Body**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| `userId` | `string` (ObjectId) | ✅ | — |
| `role` | `Role` | ❌ | `member` |

```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "role": "member"
}
```

**Response `201`**

```json
{
  "message": "Member added successfully",
  "membership": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "orgId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "role": "member",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `userId is required` |
| `404` | `Organization not found` |
| `409` | `User is already a member of this organization` |

---

### GET `/organizations/:orgId/members/:userId`

Get a single member. `userId` populated.

**Auth:** 🟣 JWT + Role (`member`)

**Response `200`**

```json
{
  "message": "Member fetched successfully",
  "membership": { ... }
}
```

---

### PATCH `/organizations/:orgId/members/:userId`

Update a member's role or status. Blocks downgrading the last owner.

**Auth:** 🟣 JWT + Role (`admin`)

**Request Body** _(at least one required)_

| Field | Type | Notes |
|-------|------|-------|
| `role` | `Role` | Cannot demote last owner |
| `status` | `Status` | |

```json
{
  "role": "admin",
  "status": "active"
}
```

**Response `200`**

```json
{
  "message": "Member updated successfully",
  "membership": { ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Cannot change role of the last owner` |
| `404` | `Member not found in this organization` |

---

### DELETE `/organizations/:orgId/members/:userId`

Remove a member from the organization. Blocks removing the last owner.

**Auth:** 🟣 JWT + Role (`admin`)

**Response `200`**

```json
{
  "message": "Member removed successfully"
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Cannot remove the last owner of an organization` |
| `404` | `Member not found in this organization` |

---

## Projects

### POST `/organizations/:orgId/projects`

Create a project inside an organization. Creator is auto-assigned as `manager` in project memberships.

**Auth:** 🟣 JWT + Role (`admin`, org level)

**Request Body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | ✅ | max 100 chars, unique per org |
| `description` | `string` | ❌ | max 500 chars |

```json
{
  "name": "My App",
  "description": "Customer-facing mobile application"
}
```

**Response `201`**

```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "name": "My App",
    "organizationId": "64f1a2b3c4d5e6f7a8b9c0d2",
    "status": "active",
    "description": "Customer-facing mobile application",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Project name is required` |
| `404` | `Organization not found` |
| `409` | `Project name already exists in this organization` |

---

### GET `/organizations/:orgId/projects`

List all projects in an organization.

**Auth:** 🟣 JWT + Role (`member`, org level)

**Response `200`**

```json
{
  "message": "Projects fetched successfully",
  "projects": [ { ... }, { ... } ]
}
```

---

### GET `/organizations/:orgId/projects/:projectId`

Get a single project. Scoped by both `_id` and `organizationId` to prevent cross-org access.

**Auth:** 🟣 JWT + Role (`member`, org level)

**Response `200`**

```json
{
  "message": "Project fetched successfully",
  "project": { "_id": "...", "name": "My App", "status": "active", ... }
}
```

---

### PATCH `/organizations/:orgId/projects/:projectId`

Update project name, description, or status.

**Auth:** 🟣 JWT + Role (`admin`, org level)

**Request Body** _(all optional)_

| Field | Type | Options |
|-------|------|---------|
| `name` | `string` | |
| `description` | `string` | |
| `status` | `Status` | `active` `inactive` `pending` `suspended` |

```json
{
  "status": "inactive",
  "description": "Archived project"
}
```

**Response `200`**

```json
{
  "message": "Project updated successfully",
  "project": { ... }
}
```

---

### DELETE `/organizations/:orgId/projects/:projectId`

Delete the project and cascade-delete all project memberships.

**Auth:** 🟣 JWT + Role (`owner`, org level)

**Response `200`**

```json
{
  "message": "Project deleted successfully"
}
```

---

## Project Members

### POST `/projects/:projectId/members`

Add a user to a project with a specific role.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body**

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `userId` | `string` | ✅ | |
| `role` | `Role` | ✅ | `manager` `contributor` `viewer` |

```json
{
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "role": "contributor"
}
```

**Response `201`**

```json
{
  "message": "Member added to project successfully",
  "membership": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "projectId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "role": "contributor",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `userId and role are required` |
| `404` | `Project not found` |
| `409` | `User is already a member of this project` |

---

### GET `/projects/:projectId/members`

List all project members. `userId` populated with user details.

**Auth:** 🟣 JWT + Role (`member`, project level)

**Response `200`**

```json
{
  "message": "Project members fetched successfully",
  "members": [ { ... } ]
}
```

---

### GET `/projects/:projectId/members/:userId`

Get a single project member.

**Auth:** 🟣 JWT + Role (`member`, project level)

**Response `200`**

```json
{
  "message": "Project member fetched successfully",
  "membership": { ... }
}
```

---

### PATCH `/projects/:projectId/members/:userId`

Update a project member's role or status. At least one field required.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body**

```json
{
  "role": "viewer",
  "status": "active"
}
```

**Response `200`**

```json
{
  "message": "Project member updated successfully",
  "membership": { ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `At least one of role or status is required` |
| `404` | `Member not found in this project` |

---

### DELETE `/projects/:projectId/members/:userId`

Remove a user from the project.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Response `200`**

```json
{
  "message": "Member removed from project successfully"
}
```

---

## Project Policy

> ⚠️ A **Password Policy must exist first** before creating a Project Policy. The server auto-links `passwordPolicyId`.

### POST `/projects/:projectId/policy`

Create the authentication policy for a project. One policy per project.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body** _(all optional, defaults shown)_

| Field | Type | Default | Options |
|-------|------|---------|---------|
| `authRequired` | `boolean` | `true` | |
| `phoneRequired` | `boolean` | `false` | |
| `authType` | `AuthType` | `password` | `password` `oauth` `2fa` |
| `authMethods` | `AuthMethod[]` | `[]` | `email` `phone` `google` `github` |
| `roles` | `string[]` | `[]` | free-form project roles |
| `statuses` | `string[]` | `[]` | free-form project statuses |

```json
{
  "authRequired": true,
  "phoneRequired": false,
  "authType": "password",
  "authMethods": ["email", "google"],
  "roles": ["admin", "user"],
  "statuses": ["active", "banned"]
}
```

**Response `201`**

```json
{
  "message": "Project policy created successfully",
  "policy": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d6",
    "projectId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "passwordPolicyId": "64f1a2b3c4d5e6f7a8b9c0d7",
    "authRequired": true,
    "phoneRequired": false,
    "authType": "password",
    "authMethods": ["email", "google"],
    "roles": ["admin", "user"],
    "statuses": ["active", "banned"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Password policy must be created before creating a project policy` |
| `404` | `Project not found` |
| `409` | `Policy already exists for this project. Use PATCH to update.` |

---

### GET `/projects/:projectId/policy`

Get the project policy. `passwordPolicyId` is populated with full password policy object.

**Auth:** 🟣 JWT + Role (`member`, project level)

**Response `200`**

```json
{
  "message": "Policy fetched successfully",
  "policy": {
    "_id": "...",
    "projectId": "...",
    "passwordPolicyId": {
      "_id": "...",
      "minLength": 8,
      "requireNumbers": true,
      "requireUppercase": true,
      "requireSpecialChars": false
    },
    "authType": "password",
    "authMethods": ["email"],
    ...
  }
}
```

---

### PATCH `/projects/:projectId/policy`

Update any fields of the project policy. At least one field required.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body** _(all optional)_

```json
{
  "authType": "oauth",
  "authMethods": ["google", "github"],
  "phoneRequired": true
}
```

**Response `200`**

```json
{
  "message": "Policy updated successfully",
  "policy": { ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `At least one field is required to update` |
| `404` | `Policy not found for this project` |

---

### DELETE `/projects/:projectId/policy`

Delete the project policy.

**Auth:** 🟣 JWT + Role (`owner`, project level)

**Response `200`**

```json
{
  "message": "Policy deleted successfully"
}
```

---

## Password Policy

### POST `/projects/:projectId/password-policy`

Create password strength rules for a project. One policy per project.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body** _(all optional, defaults shown)_

| Field | Type | Default |
|-------|------|---------|
| `minLength` | `number` | `6` |
| `requireNumbers` | `boolean` | `true` |
| `requireUppercase` | `boolean` | `true` |
| `requireSpecialChars` | `boolean` | `false` |

```json
{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": true
}
```

**Response `201`**

```json
{
  "message": "Password policy created successfully",
  "passwordPolicy": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d7",
    "projectId": "64f1a2b3c4d5e6f7a8b9c0d4",
    "minLength": 8,
    "requireNumbers": true,
    "requireUppercase": true,
    "requireSpecialChars": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `404` | `Project not found` |
| `409` | `Password policy already exists for this project. Use PATCH to update.` |

---

### GET `/projects/:projectId/password-policy`

Get the password policy for a project.

**Auth:** 🟣 JWT + Role (`member`, project level)

**Response `200`**

```json
{
  "message": "Password policy fetched successfully",
  "passwordPolicy": { ... }
}
```

---

### PATCH `/projects/:projectId/password-policy`

Update password policy rules. `minLength` must be ≥ 4.

**Auth:** 🟣 JWT + Role (`admin`, project level)

**Request Body** _(all optional, at least one required)_

```json
{
  "minLength": 10,
  "requireSpecialChars": true
}
```

**Response `200`**

```json
{
  "message": "Password policy updated successfully",
  "passwordPolicy": { ... }
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `At least one field is required to update` |
| `400` | `Minimum password length cannot be less than 4` |
| `404` | `Password policy not found for this project` |

---

### DELETE `/projects/:projectId/password-policy`

Delete the password policy. **Blocked** if a Project Policy still references it — delete the Project Policy first.

**Auth:** 🟣 JWT + Role (`owner`, project level)

**Response `200`**

```json
{
  "message": "Password policy deleted successfully"
}
```

**Errors**

| Status | Message |
|--------|---------|
| `400` | `Cannot delete password policy while a project policy references it. Delete the project policy first.` |
| `404` | `Password policy not found for this project` |

---

## Sessions

### GET `/sessions`

List all active sessions for the current user. `refreshToken` is **never returned** in this response.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "Sessions fetched successfully",
  "count": 2,
  "sessions": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d8",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### DELETE `/sessions/:sessionId`

Revoke a specific session. Scoped to `userId` so a user can never delete another user's session. If the deleted session is the current one, cookies are cleared by the controller.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "Session revoked successfully"
}
```

**Errors**

| Status | Message |
|--------|---------|
| `404` | `Session not found` |

---

### DELETE `/sessions`

Revoke all sessions for the current user (logout from all devices). Clears cookies.

**Auth:** 🔵 JWT

**Response `200`**

```json
{
  "message": "All sessions revoked successfully",
  "revokedCount": 3
}
```

---

## Middleware Reference

| Middleware | What it does |
|-----------|-------------|
| `authenticate` | Reads `accessToken` cookie → verifies JWT → sets `req.user = { userId, email }` |
| `roleAuthorize(role, type)` | Looks up org or project membership for `req.user.userId` → checks role hierarchy |
| `cookieParser` | Applied per-router to parse HTTP-only cookies |

### Role Hierarchy

```
Organization:   owner  >  admin  >  member
Project:        manager  >  contributor  >  viewer
```

Each `roleAuthorize` call passes the **minimum** role required. A user with `owner` passes an `admin` check.

---

## Database Indexes

| Collection | Index | Type |
|-----------|-------|------|
| `users` | `email` | unique |
| `organizations` | `slug` | unique |
| `organization_memberships` | `(userId, orgId)` | unique |
| `sessions` | `(userId, refreshToken)` | unique |
| `projects` | `(name, organizationId)` | unique |
| `project_memberships` | `(projectId, userId)` | unique |
| `project_policies` | `projectId` | unique |
| `password_policies` | `projectId` | unique |