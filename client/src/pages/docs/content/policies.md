# Policies

Before a single end-user can sign up to your project, you need two things configured: a **password policy** and a **project policy**. Think of them as the rulebook that governs how end-user registration works.

Here's the order you always follow — no exceptions:

```
1. Create the project
2. Create the password policy   ← what makes a valid password?
3. Create the project policy    ← how are users allowed to sign up?
4. End-users can now register
```

If you try to create a project policy before a password policy exists, you'll get an error. They have to be done in order.

---

## Part 1 — Password Policy

The password policy defines how strong end-user passwords need to be. Every project has its own, so you can have stricter rules for a banking app and looser rules for a game.

### Base URL

```
/api/v1/projects/:projectId/password-policy
```

Requires project-level `manager` or `contributor` role.

### The settings

| Field | Type | Default | What it does |
|-------|------|---------|-------------|
| `minLength` | number | `6` | Minimum number of characters. Can't be lower than 4. |
| `requireNumbers` | boolean | `true` | Password must include at least one digit |
| `requireUppercase` | boolean | `true` | Password must include at least one uppercase letter |
| `requireSpecialChars` | boolean | `false` | Password must include at least one of: `!@#$%^&*` |

### Creating the password policy

```http
POST /api/v1/projects/:projectId/password-policy
Content-Type: application/json
```

```json
{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": false
}
```

Returns `201` on success. If a policy already exists for this project, you get `400` — use PATCH to update it instead.

### Fetching it

```http
GET /api/v1/projects/:projectId/password-policy
```

Returns the current policy. If you haven't created one yet, you get `404`. Any project role can read it.

### Updating it

You only need to send the fields you want to change.

```http
PATCH /api/v1/projects/:projectId/password-policy
Content-Type: application/json
```

```json
{
  "minLength": 10,
  "requireSpecialChars": true
}
```

### Deleting it

```http
DELETE /api/v1/projects/:projectId/password-policy
```

Important: you must delete the **project policy first** before you can delete the password policy. They're linked, and the order matters.

---

## Part 2 — Project Policy

The project policy controls *how* users are allowed to sign up and log in. It references the password policy you just created.

### Base URL

```
/api/v1/projects/:projectId/policy
```

Requires project-level `manager` or `contributor`.

### The settings

| Field | Type | Default | What it does |
|-------|------|---------|-------------|
| `authRequired` | boolean | `true` | If true, users must provide an `authMethod` when signing up |
| `authType` | string | `"password"` | `"password"` means users log in with a password. `"oauth"` or `"2fa"` means they don't (and must NOT send a password) |
| `authMethods` | string[] | `[]` | Which methods are allowed. Empty list = no restriction. Options: `"email"`, `"phone"`, `"google"`, `"github"` |
| `phoneRequired` | boolean | `false` | If true and user signs up with `authMethod: "phone"`, phone number is required |
| `roles` | string[] | `[]` | Allowed roles at signup. Empty = any role is fine |
| `statuses` | string[] | `[]` | Allowed statuses at signup. Empty = any status is fine |

### Creating the project policy

A password policy must already exist before you do this.

```http
POST /api/v1/projects/:projectId/policy
Content-Type: application/json
```

Here's a typical setup for a standard email/password app:

```json
{
  "authType": "password",
  "authMethods": ["email"],
  "authRequired": true,
  "phoneRequired": false,
  "roles": ["user", "admin"],
  "statuses": ["active", "pending"]
}
```

Returns `201` on success.

### Fetching it

```http
GET /api/v1/projects/:projectId/policy
```

### Updating it

Send only the fields you want to change.

```http
PATCH /api/v1/projects/:projectId/policy
Content-Type: application/json
```

```json
{
  "roles": ["user", "admin", "moderator"],
  "authMethods": ["email", "google"]
}
```

### Deleting it

```http
DELETE /api/v1/projects/:projectId/policy
```

Delete this before deleting the password policy.

---

## How validation works at signup time

When an end-user tries to register, their data is checked against both policies in one pass. Here's what gets validated, in order:

1. Is `authMethod` in the `authMethods` list? (if the list isn't empty)
2. If `authType` is `"password"` → password must be provided
3. If `authType` is *not* `"password"` → password must *not* be sent
4. If `phoneRequired` is true and `authMethod` is `"phone"` → phone number is required
5. Is `role` in the `roles` list? (if the list isn't empty)
6. Is `status` in the `statuses` list? (if the list isn't empty)
7. Does the password meet all the password policy rules?

If anything fails, the server returns a `400` with an `errors` array that tells you exactly what went wrong:

```json
{
  "message": "Signup validation failed",
  "errors": [
    "Auth method 'google' is not allowed",
    "Password must be at least 8 characters long"
  ]
}
```

This makes it easy to display meaningful error messages to your end-users.

---

## A real-world example

Let's say you're building a consumer app. Here's a sensible setup to start with:

**Password policy:**
```json
{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": false
}
```

**Project policy:**
```json
{
  "authType": "password",
  "authMethods": ["email"],
  "authRequired": true,
  "phoneRequired": false,
  "roles": ["user"],
  "statuses": ["active"]
}
```

With this setup, end-users can only sign up with email/password, passwords need to be 8+ chars with a number and uppercase letter, and all new users get the `user` role with `active` status.