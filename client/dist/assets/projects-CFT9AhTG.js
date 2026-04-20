const e=`# Projects

Projects live inside organizations. Each project has its own members, roles, password policy, and project policy — which together control how end-users authenticate.

## Base URL

\`\`\`
/api/v1/organizations/:orgId/projects
\`\`\`

All project endpoints require authentication and at minimum an org-level membership.

## Project roles

Project members have their own role hierarchy, separate from org roles:

| Role | Permissions |
|------|-------------|
| \`manager\` | Full project access — assigned automatically to the project creator |
| \`contributor\` | Can manage policies and end-users |
| \`viewer\` | Read-only access |

> Org-level \`owner\` and \`admin\` can always access project endpoints regardless of project membership.

## POST /

Create a new project inside an organization. Requires org-level \`admin\` or \`owner\`.

\`\`\`http
POST /api/v1/organizations/:orgId/projects
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "name": "Mobile App",
  "description": "End-user auth for our mobile application"
}
\`\`\`

### Response — 201 Created

\`\`\`json
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
\`\`\`

The creator is automatically added as a \`manager\` member of the project.

## GET /

List all projects in an organization.

\`\`\`http
GET /api/v1/organizations/:orgId/projects
\`\`\`

Requires org-level \`owner\`, \`admin\`, or \`member\`.

**200 OK** — returns array of project objects.

## GET /:projectId

Fetch a single project.

\`\`\`http
GET /api/v1/organizations/:orgId/projects/:projectId
\`\`\`

**200 OK** — returns project object.

**404 Not Found** — project does not exist or belongs to a different org.

## PATCH /:projectId

Update project name or description. Requires org-level \`admin\` or \`owner\`.

\`\`\`http
PATCH /api/v1/organizations/:orgId/projects/:projectId
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "name": "Mobile App v2",
  "description": "Updated description"
}
\`\`\`

**200 OK** — returns updated project.

## DELETE /:projectId

Permanently delete a project. Requires org-level \`owner\` only.

\`\`\`http
DELETE /api/v1/organizations/:orgId/projects/:projectId
\`\`\`

> **Warning:** All policies, end-users, and sessions scoped to this project are deleted.

**200 OK**

\`\`\`json
{ "message": "Project deleted successfully" }
\`\`\`

## POST /:projectId/members

Add a member to a project. Requires project-level \`manager\`, or org-level \`admin\`/\`owner\`.

\`\`\`http
POST /api/v1/organizations/:orgId/projects/:projectId/members
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "userId": "664def456abc789012345678",
  "role": "contributor"
}
\`\`\`

**201 Created** — membership created.

**400 Bad Request** — user already a project member.

## GET /:projectId/members

List all project members.

\`\`\`http
GET /api/v1/organizations/:orgId/projects/:projectId/members
\`\`\`

Requires any project role (\`manager\`, \`contributor\`, \`viewer\`).

**200 OK** — returns array of membership objects with populated user info.

## GET /:projectId/members/:userId

Fetch a single project member.

**200 OK** — returns membership object.

## PATCH /:projectId/members/:userId

Update a member's project role. Requires \`manager\`.

\`\`\`http
PATCH /api/v1/organizations/:orgId/projects/:projectId/members/:userId
Content-Type: application/json
\`\`\`

\`\`\`json
{ "role": "viewer" }
\`\`\`

**200 OK** — returns updated membership.

## DELETE /:projectId/members/:userId

Remove a member from a project. Requires \`manager\`.

\`\`\`http
DELETE /api/v1/organizations/:orgId/projects/:projectId/members/:userId
\`\`\`

**200 OK**

\`\`\`json
{ "message": "Member removed successfully" }
\`\`\`

## Setup checklist

Before end-users can authenticate against a project, complete these steps in order:

1. Create the project — \`POST /api/v1/organizations/:orgId/projects\`
2. Create a password policy — \`POST /api/v1/projects/:projectId/password-policy\`
3. Create a project policy — \`POST /api/v1/projects/:projectId/policy\`
4. End-users can now signup at — \`POST /api/v1/project/:projectId/end-user/signup\`

See [Policies](/docs/policies) for full policy configuration details.
`;export{e as default};
