# End Users

End-users are the people who sign up to *your* app. They're completely separate from the admin/dashboard users — different database collection, different routes, different everything. An end-user belongs to a specific project and can't access anything outside of it.

---

## Before you start

You cannot accept end-user signups until you've set up two things:

1. A **Password Policy** for the project
2. A **Project Policy** for the project

If either is missing, signup will fail. See [Policies](/docs/policies) if you haven't done this yet.

---

## Base URL

```
/api/v1/project/:projectId/end-user
```

The `:projectId` must be a valid 24-character MongoDB ObjectId. If you pass an invalid one, you'll get a 400.

---

## POST /signup

Register a new end-user. Their data gets validated against your project's policy before anything is saved.

```http
POST /api/v1/project/:projectId/end-user/signup
Content-Type: application/json
```

```json
{
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "password": "Secure123!",
  "authMethod": "email",
  "role": "user",
  "status": "active"
}
```

### What each field means

| Field | Type | Required? | Notes |
|-------|------|-----------|-------|
| `fullName` | string | Yes | Max 100 characters |
| `email` | string | Yes | Must be unique within the project. Stored in lowercase. |
| `password` | string | Depends | Required when `authType` in your project policy is `"password"` |
| `phone` | string | Depends | Required if `phoneRequired` is `true` in your project policy |
| `authMethod` | string | Yes | Must match one of the allowed methods in your project policy |
| `role` | string | No | Must be in the policy's `roles` list (if that list isn't empty) |
| `status` | string | No | Must be in the policy's `statuses` list (if that list isn't empty) |

On success you get back a 201 with the new user's details. Tokens are automatically set in `httpOnly` cookies:

```json
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
```

If validation fails, you get a 400 with an `errors` array:

```json
{
  "message": "Signup validation failed",
  "errors": [
    "Auth method 'google' is not allowed",
    "Password must be at least 8 characters long"
  ]
}
```

Show these errors to your user — they're human-readable.

---

## POST /login

Authenticate an existing end-user.

```http
POST /api/v1/project/:projectId/end-user/login
Content-Type: application/json
```

```json
{
  "email": "alice@example.com",
  "password": "Secure123!"
}
```

On success, cookies are set and you get back the user object:

```json
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
```

Notice the `avatarUrl` — it's a path to your own backend, not a raw S3 URL. The backend streams the image through itself so your S3 bucket stays private. You can use this URL directly in an `<img>` tag.

**Errors:**
- `401` — wrong password
- `404` — user not found, or user is suspended (see note below)

---

## GET /logout

Log the end-user out. Deletes the session.

```http
GET /api/v1/project/:projectId/end-user/logout
```

Requires the `accessToken` cookie. No body needed.

---

## GET /profile

Fetch the full profile of the currently logged-in end-user.

```http
GET /api/v1/project/:projectId/end-user/profile
```

```json
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
```

Some fields are deliberately never returned: `passwordHash`, `avatarKey`, and `privateMetadata`. These stay on the server.

---

## PATCH /profile

Update the end-user's own profile. Only `fullName` and `phone` can be changed through this endpoint.

```http
PATCH /api/v1/project/:projectId/end-user/profile
Content-Type: application/json
```

```json
{
  "fullName": "Alice Johnson",
  "phone": "+12125551234"
}
```

You must send at least one field. Sending an empty body returns `400`.

---

## Avatars

Avatar upload, streaming, and deletion are covered in their own section. See [Avatar](/docs/avatar).

---

## Frontend example — full login flow

Here's a minimal but complete example of how to wire up login in your frontend:

```javascript
async function loginUser(projectId, email, password) {
  const res = await fetch(
    `/api/v1/project/${projectId}/end-user/login`,
    {
      method: 'POST',
      credentials: 'include',           // This is required — don't forget it
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  const { user } = await res.json();
  return user;
}

// Using the avatar URL directly in JSX
// <img src={user.avatarUrl} alt={user.fullName} />
// This works because it's the same origin — the cookie is sent automatically
```

---

## About suspended users

If a user's `status` is `"suspended"`, they can't log in. But here's the intentional part: the server returns `404 Not Found` for a suspended user — the same response as a non-existent email. This means an attacker can't figure out which email addresses are registered in your system by probing login responses.