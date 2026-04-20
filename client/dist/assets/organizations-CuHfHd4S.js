const n=`# Organizations

Organizations are the top-level entity in AuthFlow. Every project belongs to an organization, and every organization has members with roles.

## Base URL

\`\`\`
/api/v1/organizations
\`\`\`

All endpoints require authentication via the \`accessToken\` cookie.

## Roles

| Role | Permissions |
|------|-------------|
| \`owner\` | Full access — can delete the org, manage all members |
| \`admin\` | Create/update projects, manage members (cannot delete org) |
| \`member\` | Read-only — can view org and its projects |

The user who creates an organization is automatically assigned the \`owner\` role.

## POST /

Create a new organization. The creating user must have \`isVerified: true\`.

\`\`\`http
POST /api/v1/organizations
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "name": "Acme Corp",
  "description": "My organization"
}
\`\`\`

### Response — 201 Created

\`\`\`json
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
\`\`\`

## GET /:orgId

Fetch a single organization by ID.

\`\`\`http
GET /api/v1/organizations/:orgId
\`\`\`

Requires any membership role (\`owner\`, \`admin\`, or \`member\`).

**200 OK** — returns org object.

**403 Forbidden** — not a member of this org.

**404 Not Found** — org does not exist.

## PATCH /:orgId

Update organization name or description. Requires \`admin\` or \`owner\` role.

\`\`\`http
PATCH /api/v1/organizations/:orgId
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "name": "Acme Corporation",
  "description": "Updated description"
}
\`\`\`

**200 OK** — returns updated org.

**403 Forbidden** — insufficient role.

## DELETE /:orgId

Permanently delete an organization and all its projects. Requires \`owner\` role.

\`\`\`http
DELETE /api/v1/organizations/:orgId
\`\`\`

> **Warning:** This is irreversible. All projects, policies, and end-users under this org are deleted.

**200 OK**

\`\`\`json
{ "message": "Organization deleted successfully" }
\`\`\`

## GET /:orgId/members

List all members of an organization.

\`\`\`http
GET /api/v1/organizations/:orgId/members
\`\`\`

Requires \`owner\`, \`admin\`, or \`member\` role.

**200 OK**

\`\`\`json
{
  "members": [
    {
      "_id": "664abc...",
      "userId": { "_id": "...", "fullName": "Jane Doe", "email": "jane@example.com" },
      "role": "owner",
      "joinedAt": "2024-06-01T10:00:00.000Z"
    }
  ]
}
\`\`\`

## POST /:orgId/members

Add a user to the organization. Requires \`admin\` or \`owner\` role.

\`\`\`http
POST /api/v1/organizations/:orgId/members
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "userId": "664def456abc789012345678",
  "role": "member"
}
\`\`\`

**201 Created** — membership created.

**400 Bad Request** — user is already a member.

**404 Not Found** — userId not found.

## GET /:orgId/members/:userId

Fetch a specific member's details. Requires \`owner\`, \`admin\`, or \`member\` role.

**200 OK** — returns membership object with populated user.

## PATCH /:orgId/members/:userId

Update a member's role. Requires \`admin\` or \`owner\` role.

\`\`\`http
PATCH /api/v1/organizations/:orgId/members/:userId
Content-Type: application/json
\`\`\`

\`\`\`json
{ "role": "admin" }
\`\`\`

**200 OK** — returns updated membership.

**403 Forbidden** — cannot change the owner's role.

## DELETE /:orgId/members/:userId

Remove a member from the organization. Requires \`admin\` or \`owner\`.

\`\`\`http
DELETE /api/v1/organizations/:orgId/members/:userId
\`\`\`

**200 OK**

\`\`\`json
{ "message": "Member removed successfully" }
\`\`\`

**403 Forbidden** — owners cannot be removed; transfer ownership first.
`;export{n as default};
