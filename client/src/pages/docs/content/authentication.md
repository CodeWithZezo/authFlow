# Authentication

This page covers how authentication works in AuthFlow — both the token system under the hood and all the endpoints you'll call in your frontend. If you've ever wondered "where does the token actually live?" or "how does refresh work?", this is the place.

---

## The token system — how it actually works

AuthFlow uses two JWTs: an **access token** and a **refresh token**. Here's the important part — they're stored in `httpOnly` cookies, not in `localStorage`.

Why does that matter? Because `httpOnly` cookies can't be read by JavaScript at all. No script on your page — not yours, not a malicious one — can steal them. This protects you from XSS attacks.

| Cookie | Expires | What it does |
|--------|---------|--------------|
| `accessToken` | 15 minutes | Sent automatically with every request to prove who you are |
| `refreshToken` | 7 days | Used to get a new access token when the old one expires |

**The one thing you must always do:**

Every `fetch` call needs `credentials: 'include'`. Without it, the browser won't send the cookies, and every request will fail with a 401.

```javascript
// Always include this
fetch('/api/v1/auth/me', {
  credentials: 'include'
})
```

If you're using axios, set this once globally and forget about it:

```javascript
axios.defaults.withCredentials = true;
```

---

## Base URL

All authentication endpoints live here:

```
/api/v1/auth
```

---

## POST /signup

This is how new admin/dashboard users register. Not for your app's end-users — those go through a different path (see [End Users](/docs/end-users)).

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

If it works, you get back a 201 with the new user's details. The tokens are already set in cookies — you don't need to store them anywhere.

```json
{
  "message": "User created successfully",
  "user": {
    "id": "664abc123def456789012345",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": null,
    "phone": null
  }
}
```

**Things that cause a 400:**
- Email is already taken
- Password is too weak (it must pass the default validation — at least 6 characters, at least one number, at least one uppercase letter)

---

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

On success you get a 200 with the user object. Tokens are set in cookies automatically.

**Common errors:**
- `404` — no account with that email
- `401` — wrong password
- `400` — missing fields

---

## GET /me

Use this to fetch the currently logged-in user. Call it when your app loads to check if there's an active session.

```http
GET /api/v1/auth/me
```

No body, no extra headers — just make sure `credentials: 'include'` is there.

```json
{
  "user": {
    "id": "664abc...",
    "fullName": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

If the access token is expired or missing, you'll get a `401`. That's your cue to call `/refresh-token`.

---

## POST /refresh-token

When the access token expires (after 15 minutes), you call this to get a new one. The refresh token is read from the cookie automatically.

```http
POST /api/v1/auth/refresh-token
```

No body needed. On success, a new `accessToken` cookie is set and you can continue making requests.

One important detail: **refresh tokens are single-use**. Every time you refresh, the old refresh token is deleted and a new one is set. If something tries to reuse an already-used refresh token, the server returns 401. This is called token rotation and it's a security feature.

### Handling this automatically in your frontend

Here's a handy wrapper that retries requests after a token refresh:

```javascript
async function apiFetch(url, options = {}) {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) {
    // Try to refresh
    const refresh = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
    });

    if (refresh.ok) {
      // Retry the original request
      res = await fetch(url, { ...options, credentials: 'include' });
    } else {
      // Refresh failed — send user to login
      window.location.href = '/login';
    }
  }

  return res;
}
```

Use `apiFetch` everywhere instead of `fetch` and you'll never have to think about token expiry again.

---

## POST /logout

Logs out the current user. Deletes their active session from the database and clears both cookies.

```http
POST /api/v1/auth/logout
```

```json
{ "message": "User logged out successfully" }
```

After this, any request with the old tokens will fail — the session no longer exists in the database.

---

## PATCH /change-password

Let a logged-in user change their password. They need to provide their current password to confirm it's really them.

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

**Errors:**
- `401` — current password is wrong
- `400` — new password fails the strength rules

---

## Security details worth knowing

A few things happen behind the scenes that are worth understanding:

- **Suspended users get a 404 on login**, not a 401. This is intentional — it prevents someone from figuring out which emails are registered by testing different responses.
- **`avatarKey` is never returned**. The field that holds the raw S3 object key is marked `select: false` in the database schema, which means it's physically excluded from every query by default.
- **`privateMetadata` is never returned** either, for the same reason.
- Tokens are **only in cookies** — they're never in the response body. Even if someone reads your API response, they can't grab a token.