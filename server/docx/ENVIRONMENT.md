# Environment Variables

Complete reference for every environment variable used by AuthCore.

---

## Table of Contents

- [Quick Reference](#quick-reference)
- [Server](#server)
- [Database](#database)
- [JWT](#jwt)
- [bcrypt](#bcrypt)
- [Password Validation](#password-validation)
- [Cookies](#cookies)
- [Example Files](#example-files)
- [Security Rules](#security-rules)

---

## Quick Reference

| Variable                  | Required | Default        | Description                            |
|---------------------------|:--------:|----------------|----------------------------------------|
| `NODE_ENV`                | Yes      | —              | `development` or `production`          |
| `PORT`                    | No       | `5000`         | HTTP server port                       |
| `MONGODB_URI`             | Yes      | —              | MongoDB connection string              |
| `JWT_ACCESS_SECRET`       | Yes      | —              | Access token signing secret            |
| `JWT_REFRESH_SECRET`      | Yes      | —              | Refresh token signing secret           |
| `JWT_ACCESS_EXPIRES_IN`   | No       | `15m`          | Access token lifetime                  |
| `JWT_REFRESH_EXPIRES_IN`  | No       | `7d`           | Refresh token lifetime                 |
| `BCRYPT_SALT_ROUNDS`      | No       | `10`           | bcrypt salt rounds (cost factor)       |
| `PASSWORD_MIN_LENGTH`     | No       | `8`            | Signup password minimum length         |
| `PASSWORD_REQUIRE_UPPER`  | No       | `true`         | Require uppercase letter               |
| `PASSWORD_REQUIRE_LOWER`  | No       | `true`         | Require lowercase letter               |
| `PASSWORD_REQUIRE_NUMBERS`| No       | `true`         | Require number                         |
| `PASSWORD_REQUIRE_SPECIAL`| No       | `false`        | Require special character              |

---

## Server

### `NODE_ENV`

**Required.** Controls security-sensitive behavior throughout the application.

```
NODE_ENV=development   # debug logging, cookies without secure flag
NODE_ENV=production    # no debug logs, cookies are httpOnly + secure
```

Affects:
- `logger.debug()` — only emits in `development`
- Cookie `secure` flag — only `true` in `production`
- TypeScript source maps and error verbosity

### `PORT`

**Optional.** Default: `5000`.

The TCP port the Express HTTP server listens on.

```env
PORT=5000
```

In Docker, expose this port: `-p 5000:5000`. Behind a reverse proxy, Nginx forwards to this port internally.

---

## Database

### `MONGODB_URI`

**Required.** The full MongoDB connection string.

```env
# Local development
MONGODB_URI=mongodb://localhost:27017/authcore

# MongoDB Atlas (production)
MONGODB_URI=mongodb+srv://username:password@cluster.abc123.mongodb.net/authcore?retryWrites=true&w=majority

# Self-hosted with auth
MONGODB_URI=mongodb://authcore_user:strongpassword@your-server-ip:27017/authcore
```

The database name at the end of the URI (`authcore`) is created automatically on first connection. All Mongoose indexes are created on startup.

> **Never commit a production URI.** It contains credentials.

---

## JWT

AuthCore uses two separate signing secrets — one for short-lived access tokens and one for long-lived refresh tokens. They must be different.

### `JWT_ACCESS_SECRET`

**Required.** Secret used to sign and verify access tokens.

```env
JWT_ACCESS_SECRET=a64characterormorerandomhexstringgoesherepleasegeneratethisproperly
```

Generate:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Minimum: 32 characters. Recommended: 64+ characters of cryptographic randomness.

If this secret changes, all existing access tokens are immediately invalidated. Users will need to refresh or re-login.

### `JWT_REFRESH_SECRET`

**Required.** Secret used to sign and verify refresh tokens. Must be different from `JWT_ACCESS_SECRET`.

```env
JWT_REFRESH_SECRET=anothertotallydifferent64characterrandomhexstringforrefreshtoken
```

If this secret changes, all existing refresh tokens are immediately invalidated. All users will need to log in again.

### `JWT_ACCESS_EXPIRES_IN`

**Optional.** Default: `15m`.

How long an access token is valid. Uses the [ms](https://github.com/vercel/ms) format.

```env
JWT_ACCESS_EXPIRES_IN=15m    # 15 minutes (recommended)
JWT_ACCESS_EXPIRES_IN=1h     # 1 hour (less secure)
JWT_ACCESS_EXPIRES_IN=900    # 900 seconds (same as 15m)
```

Shorter = more secure (smaller window if stolen), more refresh-token round trips.

### `JWT_REFRESH_EXPIRES_IN`

**Optional.** Default: `7d`.

How long a refresh token is valid. Sessions older than this are automatically expired.

```env
JWT_REFRESH_EXPIRES_IN=7d    # 7 days (default)
JWT_REFRESH_EXPIRES_IN=30d   # 30 days ("remember me" style)
JWT_REFRESH_EXPIRES_IN=1d    # 1 day (high security)
```

---

## bcrypt

### `BCRYPT_SALT_ROUNDS`

**Optional.** Default: `10`.

The cost factor for bcrypt password hashing. Each increment doubles the computation time.

```env
BCRYPT_SALT_ROUNDS=10   # ~100ms on modern hardware — good default
BCRYPT_SALT_ROUNDS=12   # ~400ms — higher security, slower signup/login
BCRYPT_SALT_ROUNDS=14   # ~1.5s  — very high security, noticeable latency
```

| Rounds | Approx. time | Recommendation             |
|--------|--------------|----------------------------|
| 10     | ~100ms       | Default — suitable for most apps |
| 12     | ~400ms       | Recommended for financial/health apps |
| 14     | ~1.5s        | High security, adds UX latency |

> Do not use values below 10 in production.

---

## Password Validation

These variables configure the server-side password strength rules enforced at **signup** (via `PasswordUtils.validate()`). They are separate from per-project `PasswordPolicy` which is stored in MongoDB and applies to end users.

### `PASSWORD_MIN_LENGTH`

**Optional.** Default: `8`.

Minimum character length for user passwords at signup.

```env
PASSWORD_MIN_LENGTH=8
```

### `PASSWORD_REQUIRE_UPPER`

**Optional.** Default: `true`.

Require at least one uppercase letter (`A–Z`).

```env
PASSWORD_REQUIRE_UPPER=true
```

### `PASSWORD_REQUIRE_LOWER`

**Optional.** Default: `true`.

Require at least one lowercase letter (`a–z`).

```env
PASSWORD_REQUIRE_LOWER=true
```

### `PASSWORD_REQUIRE_NUMBERS`

**Optional.** Default: `true`.

Require at least one digit (`0–9`).

```env
PASSWORD_REQUIRE_NUMBERS=true
```

### `PASSWORD_REQUIRE_SPECIAL`

**Optional.** Default: `false`.

Require at least one special character from the set: `! @ # $ % ^ & * ( ) , . ? " : { } | < >`

```env
PASSWORD_REQUIRE_SPECIAL=false   # default
PASSWORD_REQUIRE_SPECIAL=true    # recommended for higher security
```

---

## Cookies

Cookie behavior is not configurable via environment variables — it is hardcoded based on `NODE_ENV`:

| Setting      | development       | production        |
|--------------|-------------------|-------------------|
| `httpOnly`   | `true`            | `true`            |
| `secure`     | `false`           | `true`            |
| `sameSite`   | `"strict"`        | `"strict"`        |
| Access maxAge| 15 min            | 15 min            |
| Refresh maxAge| 7 days           | 7 days            |

In `production`, cookies require HTTPS. If your server is behind a reverse proxy that terminates TLS, ensure the proxy sets `X-Forwarded-Proto: https`.

---

## Example Files

### `.env.example` (commit this)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/authcore

# JWT — generate real secrets before using
JWT_ACCESS_SECRET=REPLACE_WITH_64_CHAR_RANDOM_HEX
JWT_REFRESH_SECRET=REPLACE_WITH_DIFFERENT_64_CHAR_RANDOM_HEX
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# bcrypt
BCRYPT_SALT_ROUNDS=10

# Password validation (server-side, for admin user signup)
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPER=true
PASSWORD_REQUIRE_LOWER=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=false
```

### `.env.development` (local dev — do not commit)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/authcore-dev
JWT_ACCESS_SECRET=devonlysecretdonotuseproduction1234567890abcdef
JWT_REFRESH_SECRET=devonlyrefreshsecretdonotuseproduction9876543210
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=4
```

> Note: `BCRYPT_SALT_ROUNDS=4` in development makes tests faster. Never use below `10` in production.

### `.env.production` (server — never commit)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:REAL_PASSWORD@cluster.mongodb.net/authcore
JWT_ACCESS_SECRET=REAL_64_CHAR_ACCESS_SECRET_HERE
JWT_REFRESH_SECRET=REAL_64_CHAR_REFRESH_SECRET_HERE
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPER=true
PASSWORD_REQUIRE_LOWER=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL=true
```

---

## Security Rules

1. **Never commit `.env` files.** Add `.env`, `.env.production`, `.env.local`, `.env.*.local` to `.gitignore`.

2. **`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be different.** Using the same secret for both tokens eliminates the security boundary between them.

3. **JWT secrets must be cryptographically random.** Do not use passwords, usernames, or guessable strings. Use `crypto.randomBytes(64).toString('hex')`.

4. **Minimum secret length is 32 characters.** The HS256 algorithm used by `jsonwebtoken` works with any key, but short keys are brute-forceable.

5. **Rotate secrets when compromised.** If a secret is exposed, change it immediately. All tokens signed with the old secret are instantly invalidated — users must log in again.

6. **Store production secrets in a secrets manager**, not in files on disk. Options: AWS Secrets Manager, HashiCorp Vault, Doppler, Railway environment variables, Render environment variables.

7. **`MONGODB_URI` contains credentials.** Treat it with the same care as the JWT secrets.
