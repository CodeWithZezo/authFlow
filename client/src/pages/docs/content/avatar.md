# Avatar

Both admin users and end-users can upload profile pictures. Avatars are stored in a private AWS S3 bucket — the raw S3 URL is never exposed. Instead, the backend streams image bytes through itself, which keeps your bucket locked down.

---

## How avatar storage works

Here's the full pipeline when someone uploads a photo:

```
User uploads file
  └── multer validates: correct type? under 5 MB?
        └── sharp resizes to 400×400 JPEG, quality 85, strips EXIF data
              └── Old S3 object deleted (if there was a previous avatar)
                    └── New image uploaded to S3 (private)
                          └── S3 key saved to MongoDB (hidden field)
                                └── Streaming URL returned to client
```

A couple of important details about the storage side:

- The `avatarKey` field (the raw S3 object key) is marked `select: false` in the Mongoose schema. That means it's physically excluded from every database query by default and will never appear in any API response — ever.
- The `avatarUrl` in responses is always a path to your own backend, like `/api/v1/auth/avatar/664abc...`. It's never a direct S3 URL.

---

## PATCH /avatar

Upload or replace an avatar. Send as `multipart/form-data`.

**Admin user route:**
```http
PATCH /api/v1/auth/avatar
```

**End-user route:**
```http
PATCH /api/v1/project/:projectId/end-user/avatar
```

| Constraint | Value |
|------------|-------|
| Form field name | `avatar` — must be exactly this |
| Max file size | 5 MB |
| Accepted types | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Output format | 400×400 JPEG, quality 85 |

> **Do not set `Content-Type` manually.** When you use `FormData`, the browser automatically sets the correct `multipart/form-data` header with the proper boundary. If you manually set `Content-Type: multipart/form-data`, it won't include the boundary and the upload will silently fail.

### Uploading from JavaScript

```javascript
const formData = new FormData();
formData.append('avatar', file);  // 'avatar' must be exact

const res = await fetch('/api/v1/auth/avatar', {
  method: 'PATCH',
  credentials: 'include',
  body: formData,
  // Don't add headers here — let the browser handle it
});

const { avatarUrl } = await res.json();
// avatarUrl → "/api/v1/auth/avatar/664abc123def456789012345"
```

### Success response

```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "/api/v1/auth/avatar/664abc123def456789012345"
}
```

### Error responses

| Status | What happened |
|--------|--------------|
| `400` | No file attached, or field name isn't `avatar` |
| `400` | File type not allowed |
| `400` | File is over 5 MB |
| `401` | Not authenticated |
| `500` | S3 upload failed or image processing error |

---

## DELETE /avatar

Remove the avatar entirely. Deletes the file from S3 and clears the field in MongoDB.

**Admin user:**
```http
DELETE /api/v1/auth/avatar
```

**End-user:**
```http
DELETE /api/v1/project/:projectId/end-user/avatar
```

Returns `200` on success. Returns `404` if the user has no avatar to delete.

---

## GET /avatar/:userId

Stream the avatar image bytes from S3 through the backend.

**Admin user:**
```http
GET /api/v1/auth/avatar/:userId
```

**End-user:**
```http
GET /api/v1/project/:projectId/end-user/avatar/:userId
```

Returns raw `image/jpeg` bytes. The response headers include caching info:

```
Content-Type: image/jpeg
Cache-Control: private, max-age=3600
Content-Length: 12345
```

Because the streaming URL is same-origin, the browser automatically sends the `accessToken` cookie with image requests. You don't need any special auth setup.

---

## Using avatars in React

### Displaying an avatar

```tsx
function UserAvatar({ user }: { user: { fullName: string; avatarUrl: string | null } }) {
  if (!user.avatarUrl) {
    // No avatar — show initials as a placeholder
    return (
      <div className="avatar-placeholder">
        {user.fullName[0].toUpperCase()}
      </div>
    );
  }

  // avatarUrl is same-origin, cookie is sent automatically
  return (
    <img
      src={user.avatarUrl}
      alt={user.fullName}
      width={40}
      height={40}
    />
  );
}
```

### File input for uploading

```tsx
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
      // No Content-Type header — browser handles it
    });

    if (res.ok) {
      const { avatarUrl } = await res.json();
      onUpload(avatarUrl);
    }
  };

  return <input type="file" accept="image/*" onChange={handleChange} />;
}
```

---

## Why this approach?

You might wonder: why not just return the S3 URL directly? It's simpler, right?

The problem is that S3 URLs for private buckets either require signed URLs (which expire) or expose your bucket to the public. By streaming through the backend, you get:

- Your S3 bucket stays completely private — no direct access from browsers
- The auth check happens on your server before any bytes are sent
- You can add rate limiting, logging, or other middleware later
- No signed URL expiry problems to deal with