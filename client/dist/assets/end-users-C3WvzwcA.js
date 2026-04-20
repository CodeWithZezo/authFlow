const e=`# End Users

End-users are scoped to a specific project. They authenticate via your project's policy — completely separate from the admin/dashboard user system.

## Base URL

\`\`\`
/api/v1/project/:projectId/end-user
\`\`\`

The \`:projectId\` must be a valid 24-character MongoDB ObjectId.

## Prerequisites

Before any end-user can register, an admin must configure the project:

1. **Password Policy** — defines password strength rules
2. **Project Policy** — defines allowed auth methods, roles, and statuses

See [Policies](/docs/policies) for setup details.

## POST /signup

Register a new end-user for a project. Validated against the project policy.

\`\`\`http
POST /api/v1/project/:projectId/end-user/signup
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "password": "Secure123!",
  "authMethod": "email",
  "role": "user",
  "status": "active"
}
\`\`\`

### Request fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| \`fullName\` | string | yes | Max 100 characters |
| \`email\` | string | yes | Unique per project, stored lowercase |
| \`password\` | string | conditional | Required when \`authType\` is \`password\` |
| \`phone\` | string | conditional | Required if policy \`phoneRequired\` is true |
| \`authMethod\` | string | yes | Must be in policy \`authMethods\` list |
| \`role\` | string | no | Must be in policy \`roles\` list if non-empty |
| \`status\` | string | no | Must be in policy \`statuses\` list if non-empty |

### Response — 201 Created

\`\`\`json
{
  "message": "User created successfully",
  "user": {
    "_id": "664abc123def456789012345",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": null,
    "role": "user",
    "status": "active",
    "avatarUrl": null
  }
}
\`\`\`

Tokens are set in \`httpOnly\` cookies automatically.

### Validation errors — 400

\`\`\`json
{
  "message": "Signup validation failed",
  "errors": [
    "Auth method 'google' is not allowed",
    "Password must be at least 8 characters long"
  ]
}
\`\`\`

## POST /login

Authenticate an existing end-user.

\`\`\`http
POST /api/v1/project/:projectId/end-user/login
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "email": "alice@example.com",
  "password": "Secure123!"
}
\`\`\`

### Response — 200 OK

\`\`\`json
{
  "message": "User logged in successfully",
  "user": {
    "_id": "664abc...",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": null,
    "role": "user",
    "status": "active",
    "avatarUrl": "/api/v1/project/664xyz.../end-user/avatar/664abc..."
  }
}
\`\`\`

\`avatarUrl\` is the backend streaming URL — never a raw S3 URL. Use it directly in \`<img src>\`.

**401** — wrong password. **404** — user not found or suspended.

## GET /logout

Log out the current end-user. Deletes the session.

\`\`\`http
GET /api/v1/project/:projectId/end-user/logout
\`\`\`

Requires \`accessToken\` cookie. No body needed.

**200 OK**

\`\`\`json
{ "message": "User logged out successfully" }
\`\`\`

## GET /profile

Fetch the authenticated end-user's full profile.

\`\`\`http
GET /api/v1/project/:projectId/end-user/profile
\`\`\`

### Response — 200 OK

\`\`\`json
{
  "message": "Profile fetched successfully",
  "user": {
    "_id": "664abc...",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": null,
    "isVerified": false,
    "publicMetadata": {},
    "role": "user",
    "status": "active",
    "avatarUrl": null,
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-01T10:00:00.000Z"
  }
}
\`\`\`

> Fields \`passwordHash\`, \`avatarKey\`, and \`privateMetadata\` are **never** returned.

## PATCH /profile

Update the end-user's profile. At least one field must be provided.

\`\`\`http
PATCH /api/v1/project/:projectId/end-user/profile
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "fullName": "Alice Johnson",
  "phone": "+12125551234"
}
\`\`\`

Only \`fullName\` and \`phone\` can be updated via this endpoint.

**200 OK** — returns updated user object.

**400 Bad Request** — no fields provided.

## Avatar

See the [Avatar](/docs/avatar) section for full upload, stream, and delete documentation.

## Frontend setup

\`\`\`javascript
// Always include credentials so cookies are sent
const res = await fetch(
  \`/api/v1/project/\${projectId}/end-user/login\`,
  {
    method: 'POST',
    credentials: 'include',           // required
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }
);

const { user } = await res.json();

// avatarUrl works directly in an <img> tag — same-origin, cookie sent automatically
// <img src={user.avatarUrl} />
\`\`\`

## Suspended users

Users with \`status: 'suspended'\` are treated as non-existent. Login returns \`404 Not Found\` — the same as an unregistered email. This prevents user enumeration.
`;export{e as default};
