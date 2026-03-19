# AuthFlow — Multi-Tenant Auth-as-a-Service Platform

A self-hosted authentication and user management platform built with **Node.js**, **TypeScript**, **Express**, and **MongoDB**. AuthFlow lets you manage organizations, projects, and both internal team members and end-users — all with configurable authentication policies per project, similar to Clerk or Auth0 but fully self-hosted.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Role-Based Access Control](#role-based-access-control)
- [Project Policies](#project-policies)
- [Avatar & Profile System](#avatar--profile-system)
- [Frontend Integration Guide](#frontend-integration-guide)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Known Issues & Notes](#known-issues--notes)

---

## Overview

AuthFlow provides two separate user systems under one platform:

| User Type | Who They Are | How They Authenticate |
|---|---|---|
| **Internal Users** | Developers / admins who own organizations and projects | `/api/v1/auth` |
| **End Users** | End-customers of your project's app | `/api/v1/project/:projectId/end-user` |

This separation lets you build a product where your team manages organizations and projects through the admin API, while your app's customers authenticate through a project-scoped API governed by your custom policies.

---

## Architecture

```
Client Request
     │
     ▼
server.ts  (Express + Helmet + CORS + Rate Limiting)
     │
     ▼
/api/v1  (Central Router — modules/index.ts)
     │
     ├── /auth                               → User Auth + Profile Module
     ├── /organizations                      → Org Module
     │       └── /:orgId/projects            → Project Module (nested)
     ├── /projects/:projectId/policy         → Project Policy Module
     ├── /projects/:projectId/password-policy → Password Policy Module
     ├── /sessions                           → Session Module
     └── /project/:projectId/end-user        → End-User Service + Profile
```

Each module follows a clean **Controller → Service** pattern:

- **Controller** — thin layer that reads `req`, calls service, sets cookies, returns response
- **Service** — all business logic, returns `{ status, body }` (never throws)
- **Middleware** — JWT authentication, RBAC role authorization, project context resolution, image upload + resize

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (access + refresh token rotation) |
| Password Hashing | bcrypt |
| File Upload | multer (memory storage) |
| Image Processing | sharp (resize + JPEG conversion) |
| Object Storage | AWS S3 (`@aws-sdk/client-s3`) |
| Security | Helmet, CORS, express-rate-limit |
| Cookies | cookie-parser (httpOnly cookies) |
| Logging | Custom logger utility |

---

## Project Structure

```
src/
├── config/
│   ├── auth.config.ts              # JWT secrets, expiry, bcrypt rounds, password defaults
│   └── database.ts                 # MongoDB connection
│
├── middleware/
│   ├── auth.middleware.ts           # JWT verification + RBAC roleAuthorize
│   ├── endUser.middleware.ts        # resolveProjectContext (loads project + policies)
│   └── upload.middleware.ts         # multer (5 MB limit) + sharp resize → 400×400 JPEG
│
├── models/
│   ├── enums.ts                     # Role, Status, AuthType, AuthMethod enums
│   ├── models.types.ts              # TypeScript interfaces for all documents
│   └── schema/
│       ├── user.schema.ts           # avatarKey field added (select: false)
│       ├── org.schema.ts
│       ├── organizationMembership.schema.ts
│       ├── project.schema.ts
│       ├── projectMembership.schema.ts
│       ├── projectPolicy.schema.ts
│       ├── passwordPolicy.schema.ts
│       ├── session.schema.ts
│       └── endUser.schema.ts
│
├── modules/
│   ├── index.ts                     # Central router — mounts all sub-routers
│   ├── user/
│   │   ├── user.controller.ts       # Auth: signup, login, me, refresh, logout
│   │   ├── user.route.ts            # Auth + profile + avatar routes
│   │   ├── user.service.ts          # Auth business logic
│   │   ├── userProfile.controller.ts # Profile CRUD + avatar upload + streaming
│   │   └── userProfile.service.ts   # S3 upload, delete, streaming URL builder
│   ├── org/                         # Org CRUD + member management
│   ├── project/                     # Project CRUD + project member management
│   ├── projectPolicy/               # Project-level auth policy CRUD
│   ├── passwordPolicy/              # Password strength policy CRUD
│   └── session/                     # List, revoke single, revoke all sessions
│
├── services/
│   ├── api/                         # API key generation service
│   └── endUsers/
│       ├── endUser.controller.ts        # Auth: signup, login, logout
│       ├── endUser.route.ts             # Auth + profile + avatar routes
│       ├── endUser.service.ts           # Auth logic (returns streaming avatarUrl on login)
│       ├── endUserProfile.controller.ts # Profile CRUD + avatar upload + streaming
│       └── endUserProfile.service.ts   # S3 upload, delete, streaming URL builder
│
├── types/
│   ├── auth.types.ts                # JWTPayload, AuthResponse, IServiceResponse
│   └── express.types.ts             # AuthRequest interface
│
└── utils/
    ├── endUser.utils.ts             # getProjectWithPolicy (parallel DB fetch)
    ├── errors.ts                    # AppError, ValidationError, NotFoundError, etc.
    ├── jwt.utils.ts                 # JWTUtils: generate/verify access & refresh tokens
    ├── logger.ts                    # Structured logger (info, error, warn, debug)
    ├── password.utils.ts            # PasswordUtils: hash, compare, validate
    ├── password.utils.EndUser.ts    # Password validation against a project's policy
    ├── s3.utils.ts                  # uploadToS3, streamFromS3, deleteFromS3, buildAvatarKey
    ├── uinifiedSignupValidator.ts   # Validates end-user signup against project policy
    └── user.utils.ts                # RBAC helpers: membership lookups
```

---

## Core Concepts

### Organizations

An **Organization** is the top-level container. When a user creates an organization, they are automatically assigned the `owner` role. Organizations are identified by a unique `slug`.

### Projects

A **Project** belongs to one organization. Projects contain end-users and are governed by a **Project Policy** and a **Password Policy**. The user who creates a project is automatically assigned the `manager` role in that project.

### Memberships

There are two separate membership models:

- `OrganizationMembership` — links a user to an org with a role (`owner`, `admin`, `member`)
- `ProjectMembership` — links a user to a project with a role (`manager`, `contributor`, `viewer`)

### Policies

Before end-users can sign up to a project, you must configure:

1. **Password Policy** — minimum length, require numbers, uppercase, special characters
2. **Project Policy** — authentication type, allowed auth methods, allowed roles/statuses, phone requirement. Requires a password policy to exist first.

### End Users

**End Users** are distinct from internal users. They sign up through a project-scoped endpoint and are stored as both a `User` document (identity) and an `EndUser` document (project membership with role/status). Their auth rules are enforced by the project's policy at signup time.

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Register a new internal user |
| `POST` | `/login` | No | Login and receive tokens via cookies |
| `GET` | `/me` | Yes | Get current authenticated user |
| `POST` | `/refresh-token` | No | Rotate access + refresh token pair |
| `POST` | `/logout` | Yes | Logout and delete current session |
| `PATCH` | `/change-password` | Yes | Change password (requires current password) |
| `GET` | `/profile` | Yes | Get full profile with streaming `avatarUrl` |
| `PATCH` | `/profile` | Yes | Update `fullName` or `phone` |
| `PATCH` | `/avatar` | Yes | Upload profile image (`multipart/form-data`, field: `avatar`) |
| `DELETE` | `/avatar` | Yes | Remove avatar from S3 and database |
| `GET` | `/avatar/:userId` | Yes | Stream avatar image bytes to the client |

### Organizations — `/api/v1/organizations`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | Authenticated | Create organization |
| `GET` | `/:orgId` | Authenticated | Get organization |
| `PATCH` | `/:orgId` | `admin`, `owner` | Update organization |
| `DELETE` | `/:orgId` | `owner` | Delete organization |
| `GET` | `/:orgId/members` | `admin`, `owner`, `member` | List members |
| `POST` | `/:orgId/members` | `admin`, `owner` | Add member |
| `GET` | `/:orgId/members/:userId` | `admin`, `owner`, `member` | Get member |
| `PATCH` | `/:orgId/members/:userId` | `admin`, `owner` | Update member role/status |
| `DELETE` | `/:orgId/members/:userId` | `admin`, `owner` | Remove member |

### Projects — `/api/v1/organizations/:orgId/projects`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `admin`, `owner` (org) | Create project |
| `GET` | `/` | `admin`, `owner` (org) | List all projects in org |
| `GET` | `/:projectId` | `admin`, `owner`, `member` (org) | Get project |
| `PATCH` | `/:projectId` | `admin`, `owner` (org) | Update project |
| `DELETE` | `/:projectId` | `owner` (org) | Delete project |
| `POST` | `/:projectId/members` | `admin`, `owner` (project) | Add project member |
| `GET` | `/:projectId/members` | `member` (project) | List project members |
| `GET` | `/:projectId/members/:userId` | `member` (project) | Get project member |
| `PATCH` | `/:projectId/members/:userId` | `admin`, `owner` (project) | Update project member |
| `DELETE` | `/:projectId/members/:userId` | `admin`, `owner` (project) | Remove project member |

### Project Policy — `/api/v1/projects/:projectId/policy`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `manager`, `contributor` | Create project policy |
| `GET` | `/` | `manager`, `viewer`, `contributor` | Get project policy |
| `PATCH` | `/` | `manager`, `contributor` | Update project policy |
| `DELETE` | `/` | `manager`, `contributor` | Delete project policy |

### Password Policy — `/api/v1/projects/:projectId/password-policy`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `manager`, `contributor` | Create password policy |
| `GET` | `/` | `manager`, `viewer`, `contributor` | Get password policy |
| `PATCH` | `/` | `manager`, `contributor` | Update password policy |
| `DELETE` | `/` | `manager`, `contributor` | Delete password policy |

> **Note:** You cannot delete a password policy while a project policy still references it. Delete the project policy first.

### Sessions — `/api/v1/sessions`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | Yes | List all active sessions (raw refresh tokens hidden) |
| `DELETE` | `/` | Yes | Revoke all sessions (logout everywhere) |
| `DELETE` | `/:sessionId` | Yes | Revoke a specific session |

### End Users — `/api/v1/project/:projectId/end-user`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/signup` | No | End-user signup (validated against project policy) |
| `POST` | `/login` | No | End-user login |
| `GET` | `/logout` | Yes | End-user logout |
| `GET` | `/profile` | Yes | Get profile with project role/status + streaming `avatarUrl` |
| `PATCH` | `/profile` | Yes | Update `fullName` or `phone` |
| `PATCH` | `/avatar` | Yes | Upload profile image (`multipart/form-data`, field: `avatar`) |
| `DELETE` | `/avatar` | Yes | Remove avatar from S3 and database |
| `GET` | `/avatar/:userId` | Yes | Stream avatar image bytes to the client |

---

## Authentication Flow

### Token Strategy

- **Access Token** — short-lived (15 minutes), stored in `httpOnly` cookie named `accessToken`
- **Refresh Token** — long-lived (7 days), stored in `httpOnly` cookie named `refreshToken`, also saved to the `Session` collection

Using `httpOnly` cookies means tokens are never exposed to JavaScript, protecting against XSS attacks.

### Token Rotation

When `POST /refresh-token` is called:
1. The incoming refresh token is verified (JWT signature + expiry)
2. The corresponding session is looked up in the database (prevents reuse of revoked tokens)
3. The old session is deleted
4. A new access token + refresh token pair is generated
5. A new session record is created
6. New tokens are set in cookies

This implements **refresh token rotation** — each refresh token can only be used once.

### Session Revocation

- `DELETE /sessions/:sessionId` — revokes one device
- `DELETE /sessions` — revokes all devices (full logout everywhere)
- `POST /auth/logout` — revokes only the current session (single-device logout)

---

## Role-Based Access Control

### Organization Roles

| Role | Permissions |
|---|---|
| `owner` | Full control: create, read, update, delete org; manage all members |
| `admin` | Read, update org; manage members (cannot delete org or remove last owner) |
| `member` | Read org and member list only |

### Project Roles

| Role | Permissions |
|---|---|
| `manager` | Full project control: manage members, policies |
| `contributor` | Can modify policies, contribute to project |
| `viewer` | Read-only access to project and policies |

### How RBAC Works

The `roleAuthorize(roles, type)` middleware:

1. Reads the user from `req.user` (set by `authenticate` middleware)
2. Extracts `orgId` or `projectId` from params/body/query
3. Looks up the user's membership in that org or project
4. Checks if the user's role is in the list of allowed roles
5. Returns `403 Forbidden` if not authorized

---

## Project Policies

Project Policies define how end-users can authenticate with your project.

### Password Policy fields

| Field | Type | Default | Description |
|---|---|---|---|
| `minLength` | number | 6 | Minimum password length (cannot be less than 4) |
| `requireNumbers` | boolean | true | Password must contain a digit |
| `requireUppercase` | boolean | true | Password must contain an uppercase letter |
| `requireSpecialChars` | boolean | false | Password must contain a special character |

### Project Policy fields

| Field | Type | Default | Description |
|---|---|---|---|
| `authRequired` | boolean | true | Whether authentication is required |
| `authType` | `password` \| `oauth` \| `2fa` | `password` | Authentication type |
| `authMethods` | `email` \| `phone` \| `google` \| `github`[] | [] | Allowed auth methods |
| `phoneRequired` | boolean | false | Whether phone number is mandatory |
| `roles` | string[] | [] | Allowed roles for end-users (empty = no restriction) |
| `statuses` | string[] | [] | Allowed statuses for end-users (empty = no restriction) |
| `passwordPolicyId` | ObjectId | required | Reference to the project's password policy |

### Setup Order

```
1. Create a Password Policy  →  2. Create a Project Policy  →  3. End Users can sign up
```

---

## Avatar & Profile System

### How It Works

Avatar uploads go through a three-stage pipeline before anything reaches S3, and images are always served by streaming through the backend — the S3 object URL is never exposed to the client.

```
Client uploads multipart/form-data (field: "avatar")
          │
          ▼  Stage 1 — upload.middleware.ts (multer)
          │  • Validates MIME type: jpeg, png, webp, gif only
          │  • Rejects files larger than 5 MB
          │  • Buffers the file in memory (never written to disk)
          │
          ▼  Stage 2 — upload.middleware.ts (sharp)
          │  • Resizes to 400 × 400 px (cover crop, centered)
          │  • Converts any accepted format to JPEG (quality 85, progressive)
          │  • Strips EXIF metadata for privacy
          │
          ▼  Stage 3 — userProfile.service / endUserProfile.service
          │  • Deletes old avatar from S3 if one exists (no orphan objects)
          │  • Uploads processed buffer via PutObjectCommand
          │  • Stores only the S3 key in MongoDB (avatarKey, select: false)
          │  • Returns a backend streaming URL to the client
          ▼
   Response: { avatarUrl: "/api/v1/auth/avatar/<userId>" }
```

### Why the S3 URL Is Never Exposed

The `avatarKey` field on the `User` document (e.g. `avatars/users/abc123.jpg`) is marked `select: false` in the Mongoose schema, so it is excluded from every query unless explicitly selected. No controller or service ever returns this field in a response body.

The client always receives a backend streaming URL. When the client loads that URL, the server fetches the object from S3 using `GetObjectCommand` and pipes the response stream directly to the HTTP response:

```
Client:  GET /api/v1/auth/avatar/:userId
              │
              ▼  streamAvatar controller
              │  1. Look up avatarKey from DB (explicit .select("avatarKey"))
              │  2. Call streamFromS3(key) → GetObjectCommand
              │  3. stream.pipe(res)
              │     Content-Type: image/jpeg
              │     Cache-Control: private, max-age=3600
              ▼
         Browser receives raw image bytes — S3 URL never seen
```

### S3 Key Structure

```
avatars/
├── users/
│   └── <userId>.jpg       ← internal users
└── endusers/
    └── <userId>.jpg       ← end-users (your project's customers)
```

Each user has at most one avatar. Uploading a new image automatically deletes the old key from S3 before writing the replacement.

### Profile Endpoints — Internal Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/auth/profile` | Full profile. `avatarUrl` is the streaming endpoint, not an S3 URL. |
| `PATCH` | `/api/v1/auth/profile` | Update `fullName` and/or `phone`. |
| `PATCH` | `/api/v1/auth/avatar` | Upload image. Send `multipart/form-data` with field name `avatar`. Max 5 MB. |
| `DELETE` | `/api/v1/auth/avatar` | Remove avatar from S3 and clear the DB field. |
| `GET` | `/api/v1/auth/avatar/:userId` | Streams image bytes. Use directly in `<img src="...">`. |

### Profile Endpoints — End Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/project/:projectId/end-user/profile` | Profile with role/status and streaming `avatarUrl`. |
| `PATCH` | `/api/v1/project/:projectId/end-user/profile` | Update `fullName` and/or `phone`. |
| `PATCH` | `/api/v1/project/:projectId/end-user/avatar` | Upload image. Field name `avatar`. Max 5 MB. |
| `DELETE` | `/api/v1/project/:projectId/end-user/avatar` | Remove avatar. |
| `GET` | `/api/v1/project/:projectId/end-user/avatar/:userId` | Streams image bytes. |

### Login and /me Response

After login or calling `/me`, the `avatarUrl` in the response is always the backend streaming endpoint:

```json
{
  "message": "User logged in successfully",
  "user": {
    "id": "664abc...",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": "/api/v1/auth/avatar/664abc..."
  }
}
```

If no avatar has been uploaded yet, `avatarUrl` is `null`.

---

## Frontend Integration Guide

### Cookies vs. Tokens

AuthFlow stores tokens in `httpOnly` cookies automatically. Your frontend does **not** need to manually handle or store tokens — the browser sends them with every request automatically.

Make sure all API requests include credentials:

```javascript
// Using fetch
fetch('/api/v1/auth/me', { credentials: 'include' });

// Using axios
axios.defaults.withCredentials = true;
```

### CORS Setup

The server must have `credentials: true` in CORS config, and the frontend origin must be whitelisted via the `CORS_ORIGIN` environment variable. The wildcard `*` origin does **not** work with `credentials: true`.

### Internal User Flow (Admin Panel / Dashboard)

```
1. POST /api/v1/auth/signup         — register
2. POST /api/v1/auth/login          — login (tokens set in cookies)
3. GET  /api/v1/auth/me             — get current user
4. POST /api/v1/auth/refresh-token  — rotate tokens when access token expires
5. POST /api/v1/auth/logout         — logout current device
```

**Handling token expiry on the frontend:**

```javascript
async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) {
    const refreshRes = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshRes.ok) {
      res = await fetch(url, { ...options, credentials: 'include' });
    } else {
      window.location.href = '/login';
    }
  }

  return res;
}
```

### Displaying Avatars

Because `avatarUrl` is a backend streaming endpoint (not a raw S3 URL), you can use it directly in an `<img>` tag. The browser's cookie jar automatically includes the auth cookie with the image request.

```jsx
// React example
function Avatar({ user }) {
  if (!user.avatarUrl) {
    return <div className="avatar-placeholder">{user.fullName[0]}</div>;
  }
  return (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      width={40}
      height={40}
    />
  );
}
```

### Uploading an Avatar

Send a `PATCH` request with `multipart/form-data`. The field name must be `avatar`.

```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file); // field name must be "avatar"

  const res = await fetch('/api/v1/auth/avatar', {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
    // Do NOT set Content-Type — the browser sets it with the boundary automatically
  });

  const data = await res.json();
  // data.avatarUrl = "/api/v1/auth/avatar/<userId>"
  return data.avatarUrl;
}
```

For end-users change the URL to `/api/v1/project/:projectId/end-user/avatar`.

**File requirements enforced server-side:**

| Rule | Value |
|---|---|
| Maximum file size | 5 MB |
| Accepted types | JPEG, PNG, WebP, GIF |
| Output format | JPEG, 400 × 400 px, quality 85 |
| EXIF data | Stripped automatically |

### End-User Flow (Your App's Customers)

```
1. POST /api/v1/project/:projectId/end-user/signup  — register
2. POST /api/v1/project/:projectId/end-user/login   — login
3. GET  /api/v1/project/:projectId/end-user/logout  — logout
```

**Example signup request:**

```javascript
const projectId = 'YOUR_PROJECT_ID';

await fetch(`/api/v1/project/${projectId}/end-user/signup`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'SecurePass1!',
    authMethod: 'email',   // must match project policy's authMethods
    role: 'user',          // must be in project policy's roles (if configured)
    status: 'active'       // must be in project policy's statuses (if configured)
  })
});
```

### Managing Organizations and Projects (Admin Frontend)

```javascript
// 1. Create an organization (user must be verified)
const org = await apiFetch('/api/v1/organizations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Acme Corp', slug: 'acme-corp' })
});

// 2. Create a project under the org
const project = await apiFetch(`/api/v1/organizations/${org.id}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My App', description: 'Production app' })
});

// 3. Create password policy for the project
await apiFetch(`/api/v1/projects/${project.id}/password-policy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ minLength: 8, requireNumbers: true, requireUppercase: true })
});

// 4. Create project policy (requires password policy to exist first)
await apiFetch(`/api/v1/projects/${project.id}/policy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    authType: 'password',
    authMethods: ['email'],
    authRequired: true,
    phoneRequired: false,
    roles: ['user', 'admin'],
    statuses: ['active']
  })
});
```

### Response Shape

All endpoints return a consistent JSON shape:

```json
{
  "message": "Human-readable status message",
  "user": { ... },
  "org": { ... },
  "project": { ... }
}
```

Error responses:

```json
{
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/authflow

# CORS — set to your frontend URL in production
CORS_ORIGIN=http://localhost:3000

# JWT — use long random secrets in production (32+ chars)
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# AWS S3 — required for avatar upload and streaming
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-iam-access-key
AWS_SECRET_ACCESS_KEY=your-iam-secret-key
AWS_S3_BUCKET=your-bucket-name
```

> **Security:** Never commit `.env` to version control. In production, prefer IAM roles or instance profiles over hardcoded AWS credentials.

### Recommended S3 Bucket Policy

The S3 bucket must be **private** (no public access). The IAM user or role running the server needs only:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-bucket-name/avatars/*"
    }
  ]
}
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- An AWS account with an S3 bucket and IAM credentials

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd authflow

# Install dependencies
npm install

# Install avatar system dependencies
npm install @aws-sdk/client-s3 multer sharp
npm install -D @types/multer

# Copy environment file and fill in your values
cp .env.example .env

# Start in development mode
npm run dev

# Build for production
npm run build
npm start
```

### First Steps After Starting

1. **Sign up** as an internal user: `POST /api/v1/auth/signup`
2. **Verify your email** — set `isVerified: true` in MongoDB manually (no email flow yet)
3. **Create an organization**: `POST /api/v1/organizations`
4. **Create a project**: `POST /api/v1/organizations/:orgId/projects`
5. **Create a password policy**: `POST /api/v1/projects/:projectId/password-policy`
6. **Create a project policy**: `POST /api/v1/projects/:projectId/policy`
7. End-user endpoints are now live at `/api/v1/project/:projectId/end-user`
8. **Upload your avatar**: `PATCH /api/v1/auth/avatar` with `multipart/form-data`, field `avatar`

---

<!-- ## Known Issues & Notes

- **Typo in filename:** `src/utils/uinifiedSignupValidator.ts` — should be `unifiedSignupValidator.ts`
- **Typo in config:** `saltRoundes` in `auth.config.ts` should be `saltRounds`
- **Wrong collection in `user.utils.ts`:** `findProjectsByUserId` queries `Organization.find` instead of `Project.find`
- **`service.service.ts` bug:** `Project.findById({ projectId })` passes an object instead of the ID string — should be `Project.findById(projectId)`
- **Email verification:** The `isVerifiedUser` check runs when creating an org, but there is no email verification flow implemented. You must manually set `isVerified: true` in MongoDB to create organizations
- **Space in import path:** `modules/index.ts` imports `"./end user/endUser.route"` with a space in the folder name — rename the folder to `endUsers` to match the services directory
- **`endUser.middleware.ts` `RoleAuthorize`:** The function checks `projectPolicy.roles` (the list of roles allowed in the project) against the user's role, but never looks up the end-user's actual role from the `EndUser` document. This needs to query `EndUser.findOne({ userId, projectId })` and compare its `role` field
- **Avatar streaming requires auth:** The `GET /avatar/:userId` endpoint requires a valid session cookie. If you need publicly accessible avatars (e.g. for a public profile page), remove `authenticate` from that specific route and change `Cache-Control` to `public` -->