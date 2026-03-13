# AuthCore Backend

A multi-tenant authentication and user management API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. Provides full organization and project management with role-based access control, JWT authentication, and configurable security policies.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Creation Order](#creation-order)

---

## Overview

AuthCore is a backend-as-a-service style API for managing users, organizations, and projects. The core use case: you build a product — AuthCore handles your auth layer. Create a **Project**, configure an auth **Policy**, attach a **Password Policy**, and your end users authenticate through your project's rules.

**Key capabilities:**

- Multi-tenant — users belong to many organizations, orgs contain many projects
- JWT authentication via HTTP-only cookies (access + refresh token pair)
- Session tracking — every login creates a tracked session, revocable individually or in bulk
- Hierarchical RBAC — separate role systems at org level and project level
- Per-project auth policies — control allowed auth methods, roles, statuses, and password strength requirements

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Node.js 18+                         |
| Framework     | Express 4                           |
| Language      | TypeScript 5                        |
| Database      | MongoDB via Mongoose 8              |
| Auth          | JSON Web Tokens (jsonwebtoken)      |
| Passwords     | bcrypt                              |
| Cookies       | cookie-parser                       |
| Logging       | Custom logger (winston-style)       |
| Dev tooling   | ts-node-dev, ESLint, Prettier       |

---

## Architecture

The codebase follows a **Controller → Service** class-based pattern. Every module has three files:

```
module/
├── module.controller.ts   — HTTP layer: parse req, call service, send res
├── module.service.ts      — Business logic: DB queries, validation, transforms
└── module.route.ts        — Express router: path definitions + middleware chains
```

**Request lifecycle:**

```
Client Request
     │
     ▼
Express Router
     │
     ▼
Middleware (cookieParser → authenticate → roleAuthorize)
     │
     ▼
Controller method
  - destructures req.body / req.params / req.user
  - calls service method
  - destructures { status, body }
  - sends res.status(status).json(body)
     │
     ▼
Service method
  - validates inputs
  - queries MongoDB
  - returns IServiceResponse<T>
```

All service methods return `Promise<IServiceResponse<T>>`:

```typescript
interface IServiceResponse<T> {
  status: number;
  body: T;
}
```

---

## Project Structure

```
src/
├── middleware/
│   └── auth.middleware.ts        — authenticate(), roleAuthorize()
├── models/
│   ├── enums.ts                  — Role, Status, AuthType, AuthMethod
│   ├── models.types.ts           — IUser, IOrg, IProject, ISession, ...
│   └── schema/
│       ├── user.schema.ts
│       ├── session.schema.ts
│       ├── org.schema.ts
│       ├── organizationMembership.schema.ts
│       ├── project.schema.ts
│       ├── projectMembership.schema.ts
│       ├── projectPolicy.schema.ts
│       └── passwordPolicy.schema.ts
├── types/
│   └── auth.types.ts             — IServiceResponse<T>, AuthResponse, JWTPayload
├── utils/
│   ├── jwt.utils.ts
│   ├── password.utils.ts
│   ├── user.utils.ts
│   └── logger.ts
├── user/
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── user.route.ts
├── org/
│   ├── org.controller.ts
│   ├── org.service.ts
│   └── org.route.ts
├── project/
│   ├── project.controller.ts
│   ├── project.service.ts
│   └── project.route.ts
├── projectPolicy/
│   ├── projectPolicy.controller.ts
│   ├── projectPolicy.service.ts
│   └── projectPolicy.route.ts
├── passwordPolicy/
│   ├── passwordPolicy.controller.ts
│   ├── passwordPolicy.service.ts
│   └── passwordPolicy.route.ts
├── session/
│   ├── session.controller.ts
│   ├── session.service.ts
│   └── session.route.ts
├── index.route.ts                — Root router, mounts all sub-routers
└── index.ts                      — Express app entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd authcore-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start dev server with hot reload     |
| `npm run build` | Compile TypeScript to `dist/`        |
| `npm start`     | Run compiled production build        |
| `npm run lint`  | Run ESLint                           |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/authcore

# JWT
JWT_ACCESS_SECRET=your-access-token-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cookies
COOKIE_SECRET=your-cookie-secret
```

> **Security:** Use long, random strings for all secrets in production. Generate them with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

---

## Authentication

AuthCore uses a **dual-token system** stored in HTTP-only cookies:

| Token         | Lifetime | Cookie Name      | Purpose                          |
|---------------|----------|------------------|----------------------------------|
| Access Token  | 15 min   | `accessToken`    | Authorizes API requests          |
| Refresh Token | 7 days   | `refreshToken`   | Issues new access tokens         |

**Flow:**

```
POST /api/v1/auth/signup  or  POST /api/v1/auth/login
         │
         ▼
  Server creates Session document in MongoDB
  Sets accessToken cookie  (HttpOnly, 15m)
  Sets refreshToken cookie (HttpOnly, 7d)
         │
         ▼
  Client makes authenticated requests
  → accessToken validated by authenticate() middleware
  → req.user = { userId, email }
         │
         ▼
  Access token expires → POST /api/v1/auth/refresh-token
  → validates refreshToken cookie against Session collection
  → issues new accessToken cookie
         │
         ▼
  POST /api/v1/auth/logout
  → deletes Session from MongoDB
  → clears both cookies
```

The `authenticate` middleware attaches `req.user: { userId: string, email: string }` to every authenticated request.

---

## Role-Based Access Control

Two separate role hierarchies — one for organizations, one for projects.

### Organization Roles

| Role    | Hierarchy | Permissions                                              |
|---------|-----------|----------------------------------------------------------|
| `owner` | Highest   | Delete org, all admin actions                            |
| `admin` | Mid       | Update org, manage members, create/delete projects       |
| `member` | Base     | Read org and project data                                |

### Project Roles

| Role          | Hierarchy | Permissions                                         |
|---------------|-----------|-----------------------------------------------------|
| `manager`     | Highest   | Delete project/policies, all contributor actions    |
| `contributor` | Mid       | Update project, manage project members              |
| `viewer`      | Base      | Read project data and policies                      |

### How `roleAuthorize` Works

The `roleAuthorize(requiredRole, type)` middleware uses **role hierarchy** — specifying `"member"` grants access to members, admins, and owners alike:

```typescript
// Requires at least "admin" in the organization
router.patch("/:orgId", authenticate, roleAuthorize("admin", "organization"), ...)

// Requires at least "member" in the project
router.get("/:projectId/members", authenticate, roleAuthorize("member", "project"), ...)
```

It looks up the calling user's membership in the relevant org or project, checks their role against the hierarchy, and returns `403` if insufficient.

---

## API Reference

**Base URL:** `http://localhost:5000/api/v1`

All endpoints that require authentication expect the `accessToken` HTTP-only cookie to be present (set automatically by the browser after login).

---

### Auth — `/auth`

| Method  | Endpoint               | Auth     | Description                              |
|---------|------------------------|----------|------------------------------------------|
| `POST`  | `/auth/signup`         | Public   | Register a new user                      |
| `POST`  | `/auth/login`          | Public   | Login, receive JWT cookies               |
| `GET`   | `/auth/me`             | JWT      | Get current user profile                 |
| `POST`  | `/auth/refresh-token`  | Public   | Refresh access token from refresh cookie |
| `PATCH` | `/auth/change-password`| JWT      | Change password                          |
| `POST`  | `/auth/logout`         | JWT      | Logout, clear cookies, delete session    |

**Signup request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPass1!",
  "phone": "923001234567"
}
```

**Login request body:**
```json
{
  "email": "jane@example.com",
  "password": "StrongPass1!"
}
```

**Successful auth response:**
```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "phone": "923001234567"
  }
}
```

---

### Organizations — `/organizations`

| Method   | Endpoint                         | Auth          | Description                  |
|----------|----------------------------------|---------------|------------------------------|
| `POST`   | `/organizations`                 | JWT           | Create organization          |
| `GET`    | `/organizations/:orgId`          | JWT           | Get organization             |
| `PATCH`  | `/organizations/:orgId`          | JWT + admin   | Update name/slug             |
| `DELETE` | `/organizations/:orgId`          | JWT + owner   | Delete organization          |
| `GET`    | `/organizations/:orgId/members`  | JWT + member  | List members                 |
| `POST`   | `/organizations/:orgId/members`  | JWT + admin   | Add member                   |
| `GET`    | `/organizations/:orgId/members/:userId`  | JWT + member | Get member     |
| `PATCH`  | `/organizations/:orgId/members/:userId`  | JWT + admin  | Update role/status |
| `DELETE` | `/organizations/:orgId/members/:userId`  | JWT + admin  | Remove member  |

**Create org body:**
```json
{
  "name": "Acme Corp",
  "slug": "acme-corp"
}
```

---

### Projects — `/organizations/:orgId/projects`

| Method   | Endpoint                                        | Auth           | Description            |
|----------|-------------------------------------------------|----------------|------------------------|
| `POST`   | `/organizations/:orgId/projects`               | JWT + admin    | Create project         |
| `GET`    | `/organizations/:orgId/projects`               | JWT + member   | List projects          |
| `GET`    | `/organizations/:orgId/projects/:projectId`    | JWT + member   | Get project            |
| `PATCH`  | `/organizations/:orgId/projects/:projectId`    | JWT + admin    | Update project         |
| `DELETE` | `/organizations/:orgId/projects/:projectId`    | JWT + owner    | Delete project         |
| `POST`   | `/organizations/:orgId/projects/:projectId/members` | JWT + admin | Add project member |
| `GET`    | `/organizations/:orgId/projects/:projectId/members` | JWT + member | List project members |
| `GET`    | `/organizations/:orgId/projects/:projectId/members/:userId` | JWT + member | Get member |
| `PATCH`  | `/organizations/:orgId/projects/:projectId/members/:userId` | JWT + admin | Update role/status |
| `DELETE` | `/organizations/:orgId/projects/:projectId/members/:userId` | JWT + admin | Remove member |

---

### Project Policy — `/projects/:projectId/policy`

One policy per project. Must create a Password Policy first.

| Method   | Endpoint                                | Auth          | Description          |
|----------|-----------------------------------------|---------------|----------------------|
| `POST`   | `/projects/:projectId/policy`          | JWT + admin   | Create policy        |
| `GET`    | `/projects/:projectId/policy`          | JWT + member  | Get policy           |
| `PATCH`  | `/projects/:projectId/policy`          | JWT + admin   | Update policy        |
| `DELETE` | `/projects/:projectId/policy`          | JWT + owner   | Delete policy        |

**Create policy body:**
```json
{
  "authRequired": true,
  "phoneRequired": false,
  "authType": "password",
  "authMethods": ["email", "google"],
  "roles": ["viewer", "contributor"],
  "statuses": ["active"]
}
```

---

### Password Policy — `/projects/:projectId/password-policy`

Must be created **before** Project Policy. Cannot be deleted while a Project Policy references it.

| Method   | Endpoint                                         | Auth          | Description              |
|----------|--------------------------------------------------|---------------|--------------------------|
| `POST`   | `/projects/:projectId/password-policy`          | JWT + admin   | Create password policy   |
| `GET`    | `/projects/:projectId/password-policy`          | JWT + member  | Get password policy      |
| `PATCH`  | `/projects/:projectId/password-policy`          | JWT + admin   | Update password policy   |
| `DELETE` | `/projects/:projectId/password-policy`          | JWT + owner   | Delete password policy   |

**Create password policy body:**
```json
{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": false
}
```

---

### Sessions — `/sessions`

| Method   | Endpoint                    | Auth  | Description                               |
|----------|-----------------------------|-------|-------------------------------------------|
| `GET`    | `/sessions`                 | JWT   | List all active sessions for current user |
| `DELETE` | `/sessions/:sessionId`      | JWT   | Revoke a specific session                 |
| `DELETE` | `/sessions`                 | JWT   | Revoke all sessions (logs out everywhere) |

---

## Data Models

### User
```typescript
{
  _id:             ObjectId
  fullName:        string
  email:           string        // unique, lowercase
  phone:           string | null
  passwordHash:    string        // bcrypt, select: false
  isVerified:      boolean
  privateMetadata: object        // select: false
  createdAt:       Date
  updatedAt:       Date
}
```

### Organization
```typescript
{
  _id:       ObjectId
  name:      string
  slug:      string   // unique
  createdAt: Date
  updatedAt: Date
}
```

### OrganizationMembership
```typescript
{
  _id:       ObjectId
  orgId:     ObjectId → Organization
  userId:    ObjectId → User
  role:      "owner" | "admin" | "member"
  status:    "active" | "inactive" | "pending" | "suspended"
  createdAt: Date
  updatedAt: Date
}
```

### Project
```typescript
{
  _id:         ObjectId
  orgId:       ObjectId → Organization
  name:        string
  description: string | null
  status:      "active" | "inactive" | "pending" | "suspended"
  createdAt:   Date
  updatedAt:   Date
}
```

### ProjectMembership
```typescript
{
  _id:       ObjectId
  projectId: ObjectId → Project
  userId:    ObjectId → User
  role:      "manager" | "contributor" | "viewer"
  status:    "active" | "inactive" | "pending" | "suspended"
  createdAt: Date
  updatedAt: Date
}
```

### ProjectPolicy
```typescript
{
  _id:              ObjectId
  projectId:        ObjectId → Project   // unique
  authRequired:     boolean
  phoneRequired:    boolean
  authType:         "password" | "oauth" | "two_factor"
  authMethods:      ("email" | "phone" | "google" | "github")[]
  roles:            string[]
  statuses:         string[]
  passwordPolicyId: ObjectId → PasswordPolicy
  createdAt:        Date
  updatedAt:        Date
}
```

### PasswordPolicy
```typescript
{
  _id:                 ObjectId
  projectId:           ObjectId → Project   // unique
  minLength:           number
  requireNumbers:      boolean
  requireUppercase:    boolean
  requireSpecialChars: boolean
  createdAt:           Date
  updatedAt:           Date
}
```

### Session
```typescript
{
  _id:          ObjectId
  userId:       ObjectId → User
  refreshToken: string    // select: false
  createdAt:    Date
  updatedAt:    Date
}
```

---

## Error Handling

All error responses follow this shape:

```json
{
  "message": "Human-readable error description"
}
```

| HTTP Status | Meaning                                                    |
|-------------|------------------------------------------------------------|
| `400`       | Bad request — missing or invalid fields                    |
| `401`       | Unauthorized — missing, expired, or invalid token          |
| `403`       | Forbidden — authenticated but insufficient role            |
| `404`       | Not found — resource doesn't exist                         |
| `409`       | Conflict — duplicate (email, slug, unique membership, etc) |
| `500`       | Internal server error                                      |

MongoDB duplicate key errors (`error.code === 11000`) are caught and mapped to `409` responses.

---

## Creation Order

Some resources have hard dependencies. Create in this order:

```
1. User (signup)
      │
      ▼
2. Organization
      │
      ▼
3. Project (inside org)
      │
      ▼
4. Password Policy (for the project)
      │
      ▼
5. Project Policy (references Password Policy)
```

Deletion must happen in reverse:

```
Project Policy → Password Policy → Project → Organization
```

Attempting to create Project Policy without a Password Policy returns `400`.  
Attempting to delete Password Policy while a Project Policy exists returns an error at the DB level (reference integrity).

---

## License

MIT
