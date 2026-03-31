# Authentication

Authentication in AuthFlow uses **JWT tokens stored in httpOnly cookies**. There are two tokens — a short-lived access token and a long-lived refresh token.

## Base URL

All auth endpoints are mounted at:

```
/api/v1/auth
```

## How it works

Every successful login or signup sets two cookies automatically:

| Cookie | Expiry | Purpose |
|--------|--------|---------|
| `accessToken` | 15 minutes | Sent with every authenticated request |
| `refreshToken` | 7 days | Used to get a new access token |

Both cookies are `httpOnly` — they cannot be read by JavaScript. This prevents XSS token theft.

> **Important:** Always set `credentials: 'include'` on every `fetch` call, or `axios.defaults.withCredentials = true` globally. Without this, cookies are not sent.

## POST /signup

Register a new admin/dashboard user.

```http
POST /api/v1/auth/signup
Content-Type: application/json
```

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secure123!"
}
```

### Responses

**201 Created**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "664abc123def456789012345",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": null,
    "phone": null
  },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

**400 Bad Request** — email already exists or password too weak.

**500 Internal Server Error** — unexpected failure.

## POST /login

Log in with email and password.

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "jane@example.com",
  "password": "Secure123!"
}
```

### Responses

**200 OK** — tokens set in cookies, user object returned.

**400 Bad Request** — missing fields.

**401 Unauthorized** — wrong password.

**404 Not Found** — email not registered.

## GET /me

Returns the currently authenticated user. Requires `accessToken` cookie.

```http
GET /api/v1/auth/me
```

**200 OK**

```json
{
  "user": {
    "id": "664abc...",
    "fullName": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**401 Unauthorized** — token missing or expired.

## POST /refresh-token

Exchange a valid `refreshToken` cookie for a new access token. The refresh token is rotated — the old one is invalidated immediately.

```http
POST /api/v1/auth/refresh-token
```

No request body needed. The `refreshToken` cookie is read automatically.

**200 OK** — new `accessToken` cookie set.

**401 Unauthorized** — refresh token missing, expired, or already used.

### Auto-refresh pattern

```javascript
async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) {
    const refresh = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
    });
    if (refresh.ok) {
      res = await fetch(url, { ...options, credentials: 'include' });
    } else {
      window.location.href = '/login';
    }
  }
  return res;
}
```

## POST /logout

Deletes the current session and clears cookies.

```http
POST /api/v1/auth/logout
```

Requires `accessToken` cookie. No body needed.

**200 OK**

```json
{ "message": "User logged out successfully" }
```

## PATCH /change-password

Change the authenticated user's password.

```http
PATCH /api/v1/auth/change-password
Content-Type: application/json
```

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**200 OK** — password updated.

**400 Bad Request** — new password fails validation.

**401 Unauthorized** — current password is wrong.

## Security notes

- Tokens are **never** returned in the response body for end-user auth — cookies only.
- Refresh tokens are **single-use**. Reusing a revoked token returns `401`.
- Suspended users are treated as non-existent — login returns `404`.
- The `avatarKey` (S3 key) is never returned in any response.
