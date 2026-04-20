# Organizations

Organizations are the top-level container in AuthFlow. Everything — projects, end-users, policies — lives inside an organization. Before you can create a project, you need an org.

---

## How roles work

Every member of an organization has one of three roles. These roles control what they can do:

| Role | What they can do |
|------|-----------------|
| `owner` | Full control — can delete the org, manage all members, do everything |
| `admin` | Can create and update projects, manage members — but can't delete the org |
| `member` | Read-only — can view the org and its projects but can't change anything |

When you create an organization, you're automatically made the `owner`. There's always exactly one owner.

---

## Base URL

```
/api/v1/organizations
```

Every request to these endpoints needs your `accessToken` cookie. If you're not logged in, you'll get a `401`.

---

## Creating your first organization

```http
POST /api/v1/organizations
Content-Type: application/json
```

```json
{
  "name": "Acme Corp",
  "description": "My organization"
}
```

One thing to know: your account needs `isVerified: true` to create an org. When you first sign up, `isVerified` is `false`. This field is managed server-side — check your user profile to see its current value.

On success you get back the new org:

```json
{
  "message": "Organization created successfully",
  "org": {
    "_id": "664abc123def456789012345",
    "name": "Acme Corp",
    "description": "My organization",
    "createdBy": "664abc...",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
}
```

Save that `_id` — you'll need it for all the other org endpoints.

---

## Fetching an organization

```http
GET /api/v1/organizations/:orgId
```

Replace `:orgId` with the `_id` you got when you created it. You need to be a member (any role) to fetch it.

- `403` means you're not a member of this org
- `404` means the org doesn't exist

---

## Updating an organization

Change the name or description. Requires `admin` or `owner` role.

```http
PATCH /api/v1/organizations/:orgId
Content-Type: application/json
```

```json
{
  "name": "Acme Corporation",
  "description": "Updated description"
}
```

You can send just the fields you want to change — you don't need to send both.

---

## Deleting an organization

This is permanent. Be very careful.

```http
DELETE /api/v1/organizations/:orgId
```

Requires `owner` role. When you delete an org, everything inside it is deleted too — all projects, all policies, all end-users under those projects. There's no undo.

---

## Managing members

### See who's in the org

```http
GET /api/v1/organizations/:orgId/members
```

Returns an array of membership objects. Each one includes the user's details and their role:

```json
{
  "members": [
    {
      "_id": "664abc...",
      "userId": {
        "_id": "...",
        "fullName": "Jane Doe",
        "email": "jane@example.com"
      },
      "role": "owner",
      "joinedAt": "2024-06-01T10:00:00.000Z"
    }
  ]
}
```

### Add a member

You'll need the user's ID (not email — the MongoDB `_id`). Requires `admin` or `owner`.

```http
POST /api/v1/organizations/:orgId/members
Content-Type: application/json
```

```json
{
  "userId": "664def456abc789012345678",
  "role": "member"
}
```

The user must already have an account in the system. If you send a `userId` that doesn't exist, you'll get a `404`. If they're already a member, you'll get a `400`.

### View one member

```http
GET /api/v1/organizations/:orgId/members/:userId
```

Returns that member's details. Any org member can call this.

### Change a member's role

Requires `admin` or `owner`. You can't change the owner's role — if you try, you'll get a `403`.

```http
PATCH /api/v1/organizations/:orgId/members/:userId
Content-Type: application/json
```

```json
{ "role": "admin" }
```

### Remove a member

```http
DELETE /api/v1/organizations/:orgId/members/:userId
```

Requires `admin` or `owner`. You can't remove the owner — they need to transfer ownership first.

---

## A common gotcha

The org creation endpoint returns a `403` (not 404) if you're not a member of the org you're trying to access. This can be confusing at first — if you're getting a 403 and the org definitely exists, double check that you're logged in with the right account.