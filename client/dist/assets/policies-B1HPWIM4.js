const e=`# Policies

Policies control how end-users are allowed to register and authenticate within a project. There are two policy types — a **Password Policy** and a **Project Policy** — and both must be created before end-users can sign up.

## Setup order

\`\`\`
1. Create project
2. Create password policy   ← defines password strength
3. Create project policy    ← references password policy
4. End-users can now signup
\`\`\`

---

## Password Policy

Defines the minimum password strength requirements for end-users in a project.

### Base URL

\`\`\`
/api/v1/projects/:projectId/password-policy
\`\`\`

Requires project-level \`manager\` or \`contributor\` role.

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| \`minLength\` | number | \`6\` | Minimum character count. Min value: 4 |
| \`requireNumbers\` | boolean | \`true\` | At least one digit (0–9) required |
| \`requireUppercase\` | boolean | \`true\` | At least one uppercase letter required |
| \`requireSpecialChars\` | boolean | \`false\` | At least one special character required: \`!@#$%^&*\` |

### POST /

Create a password policy for the project.

\`\`\`http
POST /api/v1/projects/:projectId/password-policy
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "minLength": 8,
  "requireNumbers": true,
  "requireUppercase": true,
  "requireSpecialChars": false
}
\`\`\`

**201 Created** — policy created and linked to the project.

**400 Bad Request** — policy already exists for this project.

### GET /

Fetch the current password policy.

\`\`\`http
GET /api/v1/projects/:projectId/password-policy
\`\`\`

Requires \`manager\`, \`viewer\`, or \`contributor\`.

**200 OK** — returns policy object.

**404 Not Found** — no policy configured yet.

### PATCH /

Update specific password policy fields.

\`\`\`http
PATCH /api/v1/projects/:projectId/password-policy
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "minLength": 10,
  "requireSpecialChars": true
}
\`\`\`

**200 OK** — returns updated policy.

### DELETE /

Remove the password policy. Note: the project policy must be deleted first.

\`\`\`http
DELETE /api/v1/projects/:projectId/password-policy
\`\`\`

**200 OK**

---

## Project Policy

Defines which auth methods, roles, and statuses are allowed for end-user signup.

### Base URL

\`\`\`
/api/v1/projects/:projectId/policy
\`\`\`

Requires project-level \`manager\` or \`contributor\` role.

### Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| \`authRequired\` | boolean | \`true\` | If true, \`authMethod\` is required at signup |
| \`authType\` | string | \`"password"\` | If \`"password"\`, password must be provided; otherwise must NOT be sent |
| \`authMethods\` | string[] | \`[]\` | Allowed auth methods. Empty = no restriction |
| \`phoneRequired\` | boolean | \`false\` | If true and \`authMethod\` is \`"phone"\`, phone field is required |
| \`roles\` | string[] | \`[]\` | Allowed roles at signup. Empty = any role accepted |
| \`statuses\` | string[] | \`[]\` | Allowed statuses at signup. Empty = any status accepted |

**Allowed \`authMethods\` values:** \`"email"\`, \`"phone"\`, \`"google"\`, \`"github"\`

**Allowed \`authType\` values:** \`"password"\`, \`"oauth"\`, \`"2fa"\`

### POST /

Create the project policy. A password policy must exist first.

\`\`\`http
POST /api/v1/projects/:projectId/policy
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "authType": "password",
  "authMethods": ["email"],
  "authRequired": true,
  "phoneRequired": false,
  "roles": ["user", "admin"],
  "statuses": ["active", "pending"]
}
\`\`\`

**201 Created** — policy created.

**400 Bad Request** — policy already exists, or no password policy found.

### GET /

Fetch the current project policy.

\`\`\`http
GET /api/v1/projects/:projectId/policy
\`\`\`

**200 OK** — returns policy object.

### PATCH /

Update specific policy fields.

\`\`\`http
PATCH /api/v1/projects/:projectId/policy
Content-Type: application/json
\`\`\`

\`\`\`json
{
  "roles": ["user", "admin", "moderator"],
  "authMethods": ["email", "google"]
}
\`\`\`

**200 OK** — returns updated policy.

### DELETE /

Remove the project policy.

\`\`\`http
DELETE /api/v1/projects/:projectId/policy
\`\`\`

**200 OK**

---

## Validation at signup

When an end-user signs up, the validator checks:

1. \`authMethod\` must be in the policy's \`authMethods\` array (if non-empty)
2. If \`authType\` is \`"password"\` → password is required
3. If \`authType\` is not \`"password"\` → password must **not** be sent
4. If \`phoneRequired\` is true and \`authMethod\` is \`"phone"\` → phone is required
5. \`role\` must be in the policy's \`roles\` array (if non-empty)
6. \`status\` must be in the policy's \`statuses\` array (if non-empty)
7. Password must satisfy all password policy rules

Any failure returns \`400\` with an \`errors\` array listing each failed rule.
`;export{e as default};
