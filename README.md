# AuthFlow

**A self-hosted authentication platform built on Node.js, TypeScript, Express, and MongoDB.**

AuthFlow gives you everything Clerk or Auth0 does — organizations, projects, multi-tenant user management, JWT rotation, RBAC, avatar uploads — except the data stays on your servers. No vendor lock-in, no per-seat pricing surprises, no black box.

---

## What's Inside

- [Two Separate User Systems](#two-separate-user-systems)
- [How Requests Flow](#how-requests-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Authentication & Token Strategy](#authentication--token-strategy)
- [Role-Based Access Control](#role-based-access-control)
- [Project Policies](#project-policies)
- [Avatar & Profile System](#avatar--profile-system)
- [Frontend Integration](#frontend-integration)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Two Separate User Systems

This is probably the most important thing to understand before diving in. AuthFlow manages two completely distinct types of users:

| | Internal Users | End Users |
|---|---|---|
| **Who they are** | Your dev team, admins, project owners | Your app's actual customers |
| **Auth endpoint** | `/api/v1/auth` | `/api/v1/project/:projectId/end-user` |
| **Governed by** | Platform-level roles | Per-project policies you define |

Your team manages everything through the admin API. Your customers authenticate through a project-scoped API that follows whatever rules you've configured for that project.

---

## How Requests Flow

```
Client Request
     │
     ▼
server.ts  (Express + Helmet + CORS + Rate Limiting)
     │
     ▼
/api/v1  (Central Router)
     │
     ├── /auth                               → Internal user auth + profile
     ├── /organizations                      → Org management
     │       └── /:orgId/projects            → Project management
     ├── /projects/:projectId/policy         → Auth policy per project
     ├── /projects/:projectId/password-policy
     ├── /sessions                           → Session control
     └── /project/:projectId/end-user        → End-user auth + profile
```

Every module follows a **Controller → Service** pattern. Controllers are thin — they read the request, call the service, set cookies, and return. All real logic lives in the service layer, which always returns a plain `{ status, body }` object instead of throwing. This makes error handling consistent and testing straightforward.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Language | TypeScript |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT — access + refresh token rotation |
| Password Hashing | bcrypt |
| File Uploads | multer (memory storage) |
| Image Processing | sharp (resize + JPEG conversion) |
| Object Storage | AWS S3 (`@aws-sdk/client-s3`) |
| Security | Helmet, CORS, express-rate-limit |
| Cookies | cookie-parser (httpOnly) |
| Logging | Custom structured logger |

---

## Project Structure

```
src/
├── config/
│   ├── auth.config.ts          # JWT secrets, expiry, bcrypt rounds
│   └── database.ts             # MongoDB connection
│
├── middleware/
│   ├── auth.middleware.ts       # JWT verification + RBAC roleAuthorize
│   ├── endUser.middleware.ts    # resolveProjectContext (loads project + policies)
│   └── upload.middleware.ts     # multer (5 MB limit) + sharp → 400×400 JPEG
│
├── models/
│   ├── enums.ts                 # Role, Status, AuthType, AuthMethod enums
│   ├── models.types.ts          # TypeScript interfaces for all documents
│   └── schema/
│       ├── user.schema.ts
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
│   ├── index.ts                 # Central router
│   ├── user/                    # Internal user auth + profile
│   ├── org/                     # Org CRUD + members
│   ├── project/                 # Project CRUD + members
│   ├── projectPolicy/
│   ├── passwordPolicy/
│   └── session/
│
├── services/
│   └── endUsers/                # End-user auth + profile
│
├── types/
│   ├── auth.types.ts            # JWTPayload, AuthResponse, IServiceResponse
│   └── express.types.ts         # AuthRequest interface
│
└── utils/
    ├── jwt.utils.ts             # Generate / verify tokens
    ├── password.utils.ts        # Hash, compare, validate
    ├── password.utils.EndUser.ts # Validate against project policy
    ├── s3.utils.ts              # Upload, stream, delete from S3
    ├── uinifiedSignupValidator.ts # End-user signup validation
    ├── user.utils.ts            # RBAC helpers
    ├── errors.ts                # AppError, ValidationError, NotFoundError...
    └── logger.ts                # Structured logger
```

---

## Core Concepts

### Organizations

The top-level container. When you create one, you're automatically assigned the `owner` role. Organizations are identified by a unique `slug` you pick at creation.

### Projects

A Project lives inside an Organization and is where your end-users sign up and authenticate. Before any end-user can register, the project needs a **Password Policy** and a **Project Policy** in place. The person who creates the project automatically gets the `manager` role.

### Memberships

Two separate membership models keep things clean:

- **`OrganizationMembership`** — links an internal user to an org with a role (`owner`, `admin`, `member`)
- **`ProjectMembership`** — links an internal user to a project with a role (`manager`, `contributor`, `viewer`)

### Policies

Policies define the rules end-users must follow when signing up. Setup order matters:

```
1. Create a Password Policy  →  2. Create a Project Policy  →  3. End-users can now sign up
```

> **Note:** You can't delete a Password Policy while a Project Policy still references it. Delete the Project Policy first.

### End Users

End Users are entirely separate from internal users. They sign up through a project-scoped endpoint and are stored as both a `User` document (identity) and an `EndUser` document (project membership with role/status). All their auth rules are enforced by the project's policy at signup time.

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth? | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Register a new internal user |
| `POST` | `/login` | No | Login — tokens set in cookies |
| `GET` | `/me` | Yes | Get the current authenticated user |
| `POST` | `/refresh-token` | No | Rotate access + refresh token pair |
| `POST` | `/logout` | Yes | Logout current device |
| `PATCH` | `/change-password` | Yes | Change password (requires current password) |
| `GET` | `/profile` | Yes | Full profile with streaming `avatarUrl` |
| `PATCH` | `/profile` | Yes | Update `fullName` or `phone` |
| `PATCH` | `/avatar` | Yes | Upload image (`multipart/form-data`, field: `avatar`) |
| `DELETE` | `/avatar` | Yes | Remove avatar from S3 and database |
| `GET` | `/avatar/:userId` | Yes | Stream avatar bytes directly to client |

### Organizations — `/api/v1/organizations`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | Authenticated | Create organization |
| `GET` | `/:orgId` | Authenticated | Get organization |
| `PATCH` | `/:orgId` | `admin`, `owner` | Update organization |
| `DELETE` | `/:orgId` | `owner` | Delete organization |
| `GET` | `/:orgId/members` | `member`+ | List all members |
| `POST` | `/:orgId/members` | `admin`, `owner` | Add a member |
| `GET` | `/:orgId/members/:userId` | `member`+ | Get a specific member |
| `PATCH` | `/:orgId/members/:userId` | `admin`, `owner` | Update member role/status |
| `DELETE` | `/:orgId/members/:userId` | `admin`, `owner` | Remove a member |

### Projects — `/api/v1/organizations/:orgId/projects`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `admin`, `owner` (org) | Create project |
| `GET` | `/` | `admin`, `owner` (org) | List all projects in org |
| `GET` | `/:projectId` | `member`+ (org) | Get project |
| `PATCH` | `/:projectId` | `admin`, `owner` (org) | Update project |
| `DELETE` | `/:projectId` | `owner` (org) | Delete project |
| `POST` | `/:projectId/members` | `admin`, `owner` (project) | Add project member |
| `GET` | `/:projectId/members` | `member`+ (project) | List project members |
| `GET` | `/:projectId/members/:userId` | `member`+ (project) | Get a specific member |
| `PATCH` | `/:projectId/members/:userId` | `admin`, `owner` (project) | Update member |
| `DELETE` | `/:projectId/members/:userId` | `admin`, `owner` (project) | Remove member |

### Project Policy — `/api/v1/projects/:projectId/policy`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `manager`, `contributor` | Create policy |
| `GET` | `/` | `manager`, `contributor`, `viewer` | Get policy |
| `PATCH` | `/` | `manager`, `contributor` | Update policy |
| `DELETE` | `/` | `manager`, `contributor` | Delete policy |

### Password Policy — `/api/v1/projects/:projectId/password-policy`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| `POST` | `/` | `manager`, `contributor` | Create policy |
| `GET` | `/` | `manager`, `contributor`, `viewer` | Get policy |
| `PATCH` | `/` | `manager`, `contributor` | Update policy |
| `DELETE` | `/` | `manager`, `contributor` | Delete policy |

### Sessions — `/api/v1/sessions`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all active sessions (raw refresh tokens hidden) |
| `DELETE` | `/` | Revoke all sessions — logout everywhere |
| `DELETE` | `/:sessionId` | Revoke one specific session |

### End Users — `/api/v1/project/:projectId/end-user`

| Method | Endpoint | Auth? | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Sign up (validated against project policy) |
| `POST` | `/login` | No | Login |
| `GET` | `/logout` | Yes | Logout |
| `GET` | `/profile` | Yes | Profile with role, status, and streaming `avatarUrl` |
| `PATCH` | `/profile` | Yes | Update `fullName` or `phone` |
| `PATCH` | `/avatar` | Yes | Upload avatar |
| `DELETE` | `/avatar` | Yes | Remove avatar |
| `GET` | `/avatar/:userId` | Yes | Stream avatar bytes |

---

## Authentication & Token Strategy

AuthFlow uses two tokens, both stored in `httpOnly` cookies. That means they're invisible to JavaScript — no XSS attack can steal them.

| Token | Lifetime | Cookie Name |
|---|---|---|
| Access Token | 15 minutes | `accessToken` |
| Refresh Token | 7 days | `refreshToken` |

The refresh token is also saved to a `Session` document in MongoDB, which is what makes revocation work.

### Token Rotation

Every call to `POST /refresh-token` does this:

1. Verifies the incoming refresh token (signature + expiry)
2. Looks up the session in MongoDB — if it's been revoked, this fails
3. Deletes the old session
4. Issues a fresh access + refresh token pair
5. Creates a new session record
6. Sets both tokens in cookies

Each refresh token is single-use. Replaying a stolen token won't work because the session it belonged to no longer exists.

### Session Revocation

```
POST /auth/logout           → revoke current device only
DELETE /sessions/:sessionId → revoke one specific device
DELETE /sessions            → revoke all devices (force logout everywhere)
```

---

## Role-Based Access Control

### Organization Roles

| Role | What they can do |
|---|---|
| `owner` | Full control — create, read, update, delete org; manage all members |
| `admin` | Read + update org; manage members (can't delete org or remove the last owner) |
| `member` | Read-only access to org info and member list |

### Project Roles

| Role | What they can do |
|---|---|
| `manager` | Full project control — members, policies, everything |
| `contributor` | Can modify policies and contribute to project config |
| `viewer` | Read-only access to project and policies |

### How It Works Under the Hood

The `roleAuthorize(roles, type)` middleware:

1. Reads `req.user` (set by the `authenticate` middleware before this runs)
2. Pulls `orgId` or `projectId` from the request params/body/query
3. Looks up the user's membership record
4. Checks if their role is in the allowed list
5. Returns `403 Forbidden` if it's not — no exceptions

---

## Project Policies

### Password Policy Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `minLength` | number | `6` | Minimum password length (floor is 4) |
| `requireNumbers` | boolean | `true` | Must contain at least one digit |
| `requireUppercase` | boolean | `true` | Must contain an uppercase letter |
| `requireSpecialChars` | boolean | `false` | Must contain a special character |

### Project Policy Fields

| Field | Type | Default | Description |
|---|---|---|---|
| `authRequired` | boolean | `true` | Whether auth is enforced |
| `authType` | enum | `password` | `password` \| `oauth` \| `2fa` |
| `authMethods` | array | `[]` | `email` \| `phone` \| `google` \| `github` |
| `phoneRequired` | boolean | `false` | Is phone number mandatory at signup? |
| `roles` | string[] | `[]` | Allowed end-user roles (empty = no restriction) |
| `statuses` | string[] | `[]` | Allowed end-user statuses (empty = no restriction) |
| `passwordPolicyId` | ObjectId | required | Reference to the project's password policy |

---

## Avatar & Profile System

Avatar uploads go through a three-stage pipeline — and the raw S3 URL is never exposed to clients under any circumstances.

```
Client uploads multipart/form-data (field: "avatar")
          │
          ▼  Stage 1 — multer
          │  • Validates MIME type: jpeg, png, webp, gif only
          │  • Rejects files larger than 5 MB
          │  • Buffers entirely in memory — never hits disk
          │
          ▼  Stage 2 — sharp
          │  • Resizes to 400 × 400 px (cover crop, centered)
          │  • Converts any format to JPEG (quality 85, progressive)
          │  • Strips EXIF metadata for privacy
          │
          ▼  Stage 3 — S3 upload
          │  • Deletes old avatar first (no orphan objects)
          │  • Uploads processed buffer via PutObjectCommand
          │  • Stores only the S3 key in MongoDB (select: false)
          │  • Returns a backend streaming URL to the client
          ▼
   Response: { avatarUrl: "/api/v1/auth/avatar/<userId>" }
```

### Why S3 URLs Are Never Exposed

The `avatarKey` field on the `User` schema is marked `select: false`, so it's excluded from every Mongoose query unless explicitly requested. No controller or service ever returns it.

When the client hits the streaming endpoint, the server fetches the object from S3 using `GetObjectCommand` and pipes the response stream directly to the HTTP response. The browser gets image bytes — it never sees an S3 URL.

### S3 Key Structure

```
avatars/
├── users/
│   └── <userId>.jpg       ← internal users
└── endusers/
    └── <userId>.jpg       ← end-users (your project's customers)
```

Each user gets one avatar slot. Uploading a new image automatically deletes the old key before writing the replacement.

### Login & `/me` Response Shape

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

## Frontend Integration

### No Token Handling Required

AuthFlow sets tokens in `httpOnly` cookies automatically. Your frontend doesn't need to read, store, or attach tokens to anything — the browser handles it. Just make sure every request includes credentials:

```javascript
// fetch
fetch('/api/v1/auth/me', { credentials: 'include' });

// axios — set once globally
axios.defaults.withCredentials = true;
```

### Handling Token Expiry

Access tokens expire after 15 minutes. This wrapper automatically retries after a refresh:

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

`avatarUrl` is a backend endpoint, not a raw S3 URL — use it directly in an `<img>` tag. The browser's cookie jar attaches auth automatically.

```jsx
function Avatar({ user }) {
  if (!user.avatarUrl)
    return <div className="placeholder">{user.fullName[0]}</div>;

  return (
    <img src={user.avatarUrl} alt={user.fullName} width={40} height={40} />
  );
}
```

### Uploading an Avatar

```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file); // field name must be "avatar"

  const res = await fetch('/api/v1/auth/avatar', {
    method: 'PATCH',
    credentials: 'include',
    body: formData
    // Don't set Content-Type — the browser sets it with the boundary automatically
  });

  const data = await res.json();
  return data.avatarUrl; // "/api/v1/auth/avatar/<userId>"
}
```

For end-users, change the URL to `/api/v1/project/:projectId/end-user/avatar`.

**Server-side file requirements:**

| Rule | Value |
|---|---|
| Max file size | 5 MB |
| Accepted types | JPEG, PNG, WebP, GIF |
| Output format | JPEG, 400 × 400 px, quality 85 |
| EXIF data | Stripped automatically |

### End-User Signup Example

```javascript
await fetch(`/api/v1/project/${projectId}/end-user/signup`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'SecurePass1!',
    authMethod: 'email',  // must match the project policy's authMethods
    role: 'user',         // must be in the project policy's roles (if configured)
    status: 'active'      // must be in the project policy's statuses (if configured)
  })
});
```

### Full Admin Setup Flow

```javascript
// 1. Create an org
const org = await apiFetch('/api/v1/organizations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Acme Corp', slug: 'acme-corp' })
});

// 2. Create a project inside it
const project = await apiFetch(`/api/v1/organizations/${org.id}/projects`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My App', description: 'Production app' })
});

// 3. Create a password policy for the project
await apiFetch(`/api/v1/projects/${project.id}/password-policy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ minLength: 8, requireNumbers: true, requireUppercase: true })
});

// 4. Create the project policy (password policy must exist first)
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

// End-user endpoints are now live at /api/v1/project/${project.id}/end-user
```

### API Response Shape

All endpoints return a consistent structure:

```json
{
  "message": "Human-readable status message",
  "user": {},
  "org": {},
  "project": {}
}
```

Errors look like this:

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

# CORS — must be your exact frontend URL in production
CORS_ORIGIN=http://localhost:3000

# JWT — use long random secrets in production (32+ characters)
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret

# AWS S3 — required for avatar upload and streaming
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-iam-access-key
AWS_SECRET_ACCESS_KEY=your-iam-secret-key
AWS_S3_BUCKET=your-bucket-name
```

> In production, prefer IAM roles or instance profiles over hardcoded AWS credentials. Never commit `.env` to version control.

### Recommended S3 Bucket Policy

The bucket must be **private** (no public access). The IAM user running the server only needs these three actions:

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
- MongoDB (local or Atlas)
- AWS account with an S3 bucket and IAM credentials

### Installation

```bash
# Clone and enter the project
git clone <repo-url>
cd authflow

# Install dependencies
npm install
npm install @aws-sdk/client-s3 multer sharp
npm install -D @types/multer

# Set up environment
cp .env.example .env
# Fill in your values in .env

# Start in development mode
npm run dev

# Build and start for production
npm run build
npm start
```

### First Steps After Starting

1. **Sign up** as an internal user → `POST /api/v1/auth/signup`
2. **Verify your account** — there's no email flow yet, so set `isVerified: true` manually in MongoDB
3. **Create an organization** → `POST /api/v1/organizations`
4. **Create a project** → `POST /api/v1/organizations/:orgId/projects`
5. **Create a password policy** → `POST /api/v1/projects/:projectId/password-policy`
6. **Create a project policy** → `POST /api/v1/projects/:projectId/policy`
7. End-user endpoints are now live at `/api/v1/project/:projectId/end-user`
8. **Upload your avatar** → `PATCH /api/v1/auth/avatar` with `multipart/form-data`, field `avatar`