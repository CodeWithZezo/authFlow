# API Versioning

This document explains how API versioning works in AuthCore, the current versioning strategy, rules for making changes to existing endpoints, and how to introduce a new version.

---

## Table of Contents

- [Current Version](#current-version)
- [Versioning Strategy](#versioning-strategy)
- [URL Structure](#url-structure)
- [Change Classification](#change-classification)
- [Rules for Backwards-Compatible Changes](#rules-for-backwards-compatible-changes)
- [Rules for Breaking Changes](#rules-for-breaking-changes)
- [How to Add a New Version](#how-to-add-a-new-version)
- [Deprecation Policy](#deprecation-policy)
- [Changelog](#changelog)

---

## Current Version

**Active version: `v1`**

All endpoints are served under `/api/v1`. There is currently one active version. No deprecated versions exist.

---

## Versioning Strategy

AuthCore uses **URL path versioning**:

```
/api/v1/auth/login
/api/v1/organizations/:orgId
/api/v1/projects/:projectId/policy
```

This approach was chosen because:

- The version is explicit and visible in every request and log
- It works cleanly with HTTP-only cookie auth (no header negotiation needed)
- Tools like Swagger UI, Postman, and curl work without extra configuration
- Frontend stores can hardcode base URLs per version

Alternative strategies (header versioning, query param versioning) were considered and rejected — header versioning is invisible in browser address bars and harder to test manually; query param versioning pollutes every URL.

---

## URL Structure

```
https://api.yourdomain.com/api/v1/<resource>
                           ─── ── ──────────
                            │   │      └── resource path
                            │   └── version prefix
                            └── API namespace (keeps non-API routes clean)
```

The version prefix is applied at the root router level in `src/index.ts`:

```typescript
app.use("/api/v1", router);
```

All sub-routers registered in `src/index.route.ts` inherit this prefix automatically.

---

## Change Classification

Before making any change to an existing endpoint, classify it:

### Non-breaking (backwards-compatible)

These changes can be made to the current version without a new version:

| Change | Example |
|--------|---------|
| Add an **optional** request body field | Adding `description` to create org |
| Add a new field to a **response** body | Adding `memberCount` to org response |
| Add a **new endpoint** to an existing module | Adding `GET /auth/me/orgs` |
| Add a **new module** entirely | Adding an `endUsers` module |
| Change a **5xx** to a more specific **4xx** | Changing 500 → 409 on duplicate |
| Improve **error messages** (same status code) | More descriptive validation text |
| Add a new **optional** query parameter | `?status=active` filter |

### Breaking (requires new version)

These changes must **not** be made to `v1` — they require a `v2`:

| Change | Example |
|--------|---------|
| Remove a field from a response | Removing `phone` from user response |
| Rename a response body key | Renaming `org` → `organization` |
| Change a field type | Changing `phone` from string to object |
| Make an optional field required | Requiring `slug` on org update |
| Change an HTTP method | Changing `POST /logout` → `DELETE /session` |
| Change a URL path | Renaming `/auth/me` → `/users/me` |
| Remove an endpoint | Removing `POST /auth/refresh-token` |
| Change a status code meaning | 404 → 403 for missing membership |
| Remove an enum value | Removing `"pending"` from Status |

If you are uncertain, classify it as breaking.

---

## Rules for Backwards-Compatible Changes

When making a non-breaking change to `v1`:

1. **New response fields** — add them to the service return value and document in `swagger/paths/<module>.yml`. Clients that don't know about the field will ignore it safely.

2. **New optional request fields** — add them to the service's input interface with `?` and provide a sensible default. Never assume the field is present.

3. **New endpoints** — add route, controller, service following the module pattern. Register in `index.route.ts`. Add to `swagger/paths/<module>.yml` and `swagger/swagger.yml`.

4. **Schema changes** — if adding a new field to a Mongoose schema, always set a `default` value to avoid breaking existing documents.

```typescript
// Safe — existing documents get default value
newField: {
  type: String,
  default: null,
}

// Unsafe — breaks existing documents without the field
newField: {
  type: String,
  required: true,   // ← never add required: true to an existing schema field
}
```

---

## Rules for Breaking Changes

When a breaking change is required:

### 1. Create the v2 router

```typescript
// src/index.ts
import routerV1 from "./index.route";
import routerV2 from "./v2/index.route";

app.use("/api/v1", routerV1);
app.use("/api/v2", routerV2);
```

### 2. Duplicate only the affected module

Do not copy the entire codebase. Duplicate only the module(s) with breaking changes:

```
src/
├── org/                    ← v1, unchanged
├── user/                   ← v1, unchanged
└── v2/
    ├── index.route.ts      ← mounts v2 modules + re-exports unchanged v1 modules
    └── org/                ← only this module changed
        ├── org.controller.ts
        ├── org.service.ts
        └── org.route.ts
```

Unchanged modules can be re-exported from v1 in the v2 router:

```typescript
// src/v2/index.route.ts
import userRouter from "../user/user.route";     // unchanged — reuse v1
import orgRouter  from "./org/org.route";        // changed — use v2

router.use("/auth", userRouter);
router.use("/organizations", orgRouter);         // v2 behaviour
```

### 3. Add a `Sunset` response header to deprecated v1 endpoints

```typescript
// In the v1 controller for deprecated endpoints
res.set("Sunset", "Sat, 01 Jan 2026 00:00:00 GMT");
res.set("Deprecation", "true");
```

### 4. Update Swagger

Create `swagger/v2/` mirroring the v1 structure. Add a second entry under `servers` in `swagger/v2/swagger.yml`.

---

## Deprecation Policy

When a version is deprecated:

| Timeline        | Action                                                     |
|-----------------|------------------------------------------------------------|
| Announcement    | Add `Deprecation: true` header to all deprecated endpoints |
| 3 months notice | Add `Sunset` header with the exact shutdown date           |
| Shutdown date   | Return `410 Gone` from all deprecated endpoints            |

The minimum deprecation notice period is **6 months** for production versions.

---

## Changelog

### v1.0.0 — Initial release

**Auth (`/auth`)**
- `POST /auth/signup` — Register user, returns user + sets auth cookies
- `POST /auth/login` — Login, returns user + sets auth cookies
- `GET /auth/me` — Get current user (note: returns `_id` not `id`)
- `POST /auth/refresh-token` — Refresh access token via refresh cookie
- `PATCH /auth/change-password` — Change password
- `POST /auth/logout` — Clear session and cookies

**Organizations (`/organizations`)**
- Full CRUD on organizations
- Member management: add, get, list, update role/status, remove
- Owner is auto-assigned on create; last owner cannot be removed or downgraded

**Projects (`/organizations/:orgId/projects`)**
- Full CRUD on projects (nested under org)
- Member management with project roles: manager, contributor, viewer
- Creator is auto-assigned as manager on create

**Project Policy (`/projects/:projectId/policy`)**
- POST / GET / PATCH / DELETE
- Requires a PasswordPolicy to exist first

**Password Policy (`/projects/:projectId/password-policy`)**
- POST / GET / PATCH / DELETE
- Cannot be deleted while a ProjectPolicy references it

**Sessions (`/sessions`)**
- `GET /sessions` — List active sessions (sorted newest first, includes `count`)
- `DELETE /sessions/:sessionId` — Revoke specific session
- `DELETE /sessions` — Revoke all sessions (includes `revokedCount`)
