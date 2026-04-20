# Projects

Projects live inside organizations. Each project represents one of your apps — a mobile app, a web product, a game, whatever you're building. Your end-users authenticate through a specific project, not through the platform as a whole.

Every project has its own:
- **Members** (separate from org members)
- **Password policy** (controls how strong end-user passwords must be)
- **Project policy** (controls which auth methods and roles are allowed)

---

## Project roles vs. org roles

Here's something that trips people up: projects have their *own* role system, completely separate from org roles.

| Role | What they can do |
|------|-----------------|
| `manager` | Full project access — assigned automatically to whoever creates the project |
| `contributor` | Can manage policies and end-users |
| `viewer` | Read-only — can see the project and its data |

There's one important exception: **org-level `owner` and `admin` can always access project endpoints**, even if they're not a project member. So if you're the org owner, you don't need to add yourself to every project.

---

## Base URL

All project endpoints are nested under their organization:

```
/api/v1/organizations/:orgId/projects
```

---

## Creating a project

Requires org-level `admin` or `owner`.

```http
POST /api/v1/organizations/:orgId/projects
Content-Type: application/json
```

```json
{
  "name": "Mobile App",
  "description": "End-user auth for our mobile application"
}
```

You get back the new project:

```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "664proj123def456789012",
    "name": "Mobile App",
    "description": "End-user auth for our mobile application",
    "orgId": "664abc123def456789012345",
    "createdBy": "664abc...",
    "createdAt": "2024-06-01T10:00:00.000Z"
  }
}
```

You're automatically added as a `manager` of the project. Save the `_id` — you'll use it constantly.

---

## Listing and fetching projects

**List all projects in an org:**

```http
GET /api/v1/organizations/:orgId/projects
```

Returns an array. Requires any org-level membership.

**Fetch a single project:**

```http
GET /api/v1/organizations/:orgId/projects/:projectId
```

Returns a `404` if the project doesn't exist or if it belongs to a different org (this prevents guessing IDs across organizations).

---

## Updating a project

Change the name or description. Requires org-level `admin` or `owner`.

```http
PATCH /api/v1/organizations/:orgId/projects/:projectId
Content-Type: application/json
```

```json
{
  "name": "Mobile App v2"
}
```

---

## Deleting a project

**This is permanent.** Requires org-level `owner` only.

```http
DELETE /api/v1/organizations/:orgId/projects/:projectId
```

Everything scoped to this project is deleted: policies, end-users, sessions. No recovery.

---

## Managing project members

### Add a member

The user must already have a dashboard account. Requires project `manager` or org-level `admin`/`owner`.

```http
POST /api/v1/organizations/:orgId/projects/:projectId/members
Content-Type: application/json
```

```json
{
  "userId": "664def456abc789012345678",
  "role": "contributor"
}
```

### List all members

```http
GET /api/v1/organizations/:orgId/projects/:projectId/members
```

Returns membership objects with populated user info. Requires any project role.

### Get one member

```http
GET /api/v1/organizations/:orgId/projects/:projectId/members/:userId
```

### Update a member's role

Requires project `manager`.

```http
PATCH /api/v1/organizations/:orgId/projects/:projectId/members/:userId
Content-Type: application/json
```

```json
{ "role": "viewer" }
```

### Remove a member

```http
DELETE /api/v1/organizations/:orgId/projects/:projectId/members/:userId
```

Requires project `manager`.

---

## Before end-users can sign up — a checklist

You can't just create a project and start accepting end-users right away. There are two policies you need to configure first. Here's the exact order:

1. ✅ Create the project
2. ✅ Create a **password policy** — `POST /api/v1/projects/:projectId/password-policy`
3. ✅ Create a **project policy** — `POST /api/v1/projects/:projectId/policy`
4. 🎉 End-users can now sign up at `POST /api/v1/project/:projectId/end-user/signup`

If you skip step 2 or 3, the signup endpoint will return an error. The policies need to exist before any end-user registration attempt.

Head over to [Policies](/docs/policies) for the full details on setting these up.