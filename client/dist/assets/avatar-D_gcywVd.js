const e=`# Avatar

Avatars are stored in a private AWS S3 bucket. The S3 URL is **never exposed** — the backend streams image bytes directly to the client, protecting your bucket from public access.

This applies to both admin users (\`/api/v1/auth/avatar\`) and end-users (\`/api/v1/project/:projectId/end-user/avatar\`).

## How it works

\`\`\`
Client uploads file
       ↓
multer validates type + size (max 5 MB)
       ↓
sharp resizes to 400×400 JPEG, quality 85, strips EXIF
       ↓
Old S3 object deleted (if exists)
       ↓
Buffer uploaded to S3 (private ACL)
       ↓
S3 key stored in MongoDB (select: false — never returned)
       ↓
Streaming URL returned to client
\`\`\`

The \`avatarKey\` field is marked \`select: false\` in Mongoose — it is excluded from all queries by default and never appears in any response.

## PATCH /avatar

Upload or replace an avatar. Send as \`multipart/form-data\`.

\`\`\`http
PATCH /api/v1/auth/avatar
Content-Type: multipart/form-data
\`\`\`

| Constraint | Value |
|------------|-------|
| Field name | \`avatar\` (must be exact) |
| Max size | 5 MB |
| Accepted types | \`image/jpeg\`, \`image/png\`, \`image/webp\`, \`image/gif\` |
| Output | 400×400 JPEG, quality 85 |

> **Do NOT set \`Content-Type\` manually.** The browser sets it automatically with the correct multipart boundary when using \`FormData\`. Setting it manually breaks the upload.

### Request example

\`\`\`javascript
const formData = new FormData();
formData.append('avatar', file);  // field name must be 'avatar'

const res = await fetch('/api/v1/auth/avatar', {
  method: 'PATCH',
  credentials: 'include',
  body: formData,
  // No Content-Type header!
});

const { avatarUrl } = await res.json();
\`\`\`

### Response — 200 OK

\`\`\`json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/api/v1/auth/avatar/664abc123def456789012345"
}
\`\`\`

### Error responses

| Status | Cause |
|--------|-------|
| \`400\` | No file attached — field name must be \`avatar\` |
| \`400\` | Unsupported file type |
| \`400\` | File exceeds 5 MB |
| \`401\` | Not authenticated |
| \`500\` | S3 upload failed or image processing error |

## DELETE /avatar

Remove the avatar. Deletes the S3 object and clears the field in MongoDB.

\`\`\`http
DELETE /api/v1/auth/avatar
\`\`\`

**200 OK**

\`\`\`json
{ "message": "Avatar deleted successfully" }
\`\`\`

**404 Not Found** — user has no avatar to delete.

## GET /avatar/:userId

Stream the avatar image bytes from S3 through the backend.

\`\`\`http
GET /api/v1/auth/avatar/:userId
\`\`\`

Requires authentication. Returns raw \`image/jpeg\` bytes with caching headers.

### Response headers

\`\`\`
Content-Type: image/jpeg
Cache-Control: private, max-age=3600
Content-Length: 12345
\`\`\`

### Using in React

\`\`\`tsx
function UserAvatar({ user }: { user: { fullName: string; avatarUrl: string | null } }) {
  if (!user.avatarUrl) {
    return (
      <div className="avatar-placeholder">
        {user.fullName[0].toUpperCase()}
      </div>
    );
  }

  // avatarUrl is same-origin — the browser sends the accessToken cookie automatically
  return (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      width={40}
      height={40}
    />
  );
}
\`\`\`

Because the streaming URL is same-origin, the browser sends the \`accessToken\` cookie with the image request automatically. No manual auth headers needed.

## End-user avatar URLs

For end-users, the base path is different:

\`\`\`
PATCH  /api/v1/project/:projectId/end-user/avatar
DELETE /api/v1/project/:projectId/end-user/avatar
GET    /api/v1/project/:projectId/end-user/avatar/:userId
\`\`\`

The logic is identical — same constraints, same streaming approach.

## File input component

\`\`\`tsx
function AvatarUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('avatar', file);

    const res = await fetch('/api/v1/auth/avatar', {
      method: 'PATCH',
      credentials: 'include',
      body: form,
    });

    if (res.ok) {
      const { avatarUrl } = await res.json();
      onUpload(avatarUrl);
    }
  };

  return <input type="file" accept="image/*" onChange={handleChange} />;
}
\`\`\`
`;export{e as default};
