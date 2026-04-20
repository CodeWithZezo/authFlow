const e=`# Sessions

Every login creates a session record in MongoDB tied to the user's refresh token. Sessions let users see all their active logins and revoke any of them remotely.

## Base URL

\`\`\`
/api/v1/sessions
\`\`\`

All endpoints require the \`accessToken\` cookie.

## How sessions work

When a user logs in, a \`Session\` document is created:

\`\`\`json
{
  "_id": "664session...",
  "userId": "664abc...",
  "refreshToken": "<hashed>",
  "createdAt": "2024-06-01T10:00:00.000Z",
  "updatedAt": "2024-06-01T10:00:00.000Z"
}
\`\`\`

The refresh token stored is **hashed** — the raw token only lives in the cookie. When the user refreshes, the incoming token is hashed and compared against stored sessions.

## GET /

List all active sessions for the current user. Useful for a "manage devices" screen.

\`\`\`http
GET /api/v1/sessions
\`\`\`

### Response — 200 OK

\`\`\`json
{
  "sessions": [
    {
      "_id": "664sess1...",
      "userId": "664abc...",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-02T08:30:00.000Z"
    },
    {
      "_id": "664sess2...",
      "userId": "664abc...",
      "createdAt": "2024-05-28T14:15:00.000Z",
      "updatedAt": "2024-05-30T09:00:00.000Z"
    }
  ]
}
\`\`\`

\`updatedAt\` reflects the last time this session's refresh token was used — a proxy for "last seen."

## DELETE /:sessionId

Revoke a specific session. The user is logged out on that device the next time it tries to refresh.

\`\`\`http
DELETE /api/v1/sessions/:sessionId
\`\`\`

**200 OK**

\`\`\`json
{ "message": "Session revoked successfully" }
\`\`\`

**403 Forbidden** — session belongs to a different user.

**404 Not Found** — session does not exist or already revoked.

## DELETE /

Revoke **all** sessions for the current user except the current one. Forces logout on all other devices.

\`\`\`http
DELETE /api/v1/sessions
\`\`\`

**200 OK**

\`\`\`json
{ "message": "All sessions revoked" }
\`\`\`

## Building a sessions UI

\`\`\`tsx
function SessionsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('/api/v1/sessions', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setSessions(d.sessions));
  }, []);

  const revoke = async (id) => {
    await fetch(\`/api/v1/sessions/\${id}\`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setSessions(s => s.filter(x => x._id !== id));
  };

  return (
    <ul>
      {sessions.map(s => (
        <li key={s._id}>
          <span>Last active: {new Date(s.updatedAt).toLocaleString()}</span>
          <button onClick={() => revoke(s._id)}>Revoke</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

## Session lifecycle

\`\`\`
Login
  └─ Session created  ──────────────────────────────┐
                                                     │
  accessToken expires (15 min)                      │
        ↓                                            │
  POST /refresh-token                               │ refreshToken (7 days)
        ↓                                            │
  Old session deleted, new session created  ◄───────┘
        ↓
  Logout or token expiry
        ↓
  Session deleted
\`\`\`

Refresh tokens are **rotated** on every use — each refresh creates a new session document and invalidates the old one. If a revoked refresh token is reused, the server returns \`401\`.
`;export{e as default};
