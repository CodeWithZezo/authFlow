# Deployment

This document covers how to build, containerize, and deploy the AuthCore backend — from a simple VPS setup to a production-grade Docker + reverse proxy configuration.

---

## Table of Contents

- [Build](#build)
- [Environment Variables](#environment-variables)
- [Running in Production](#running-in-production)
- [Docker](#docker)
- [Docker Compose](#docker-compose)
- [Reverse Proxy — Nginx](#reverse-proxy--nginx)
- [MongoDB in Production](#mongodb-in-production)
- [Health Check](#health-check)
- [Process Management — PM2](#process-management--pm2)
- [Deployment Checklist](#deployment-checklist)

---

## Build

```bash
# Install dependencies (skip devDependencies)
npm ci --omit=dev

# Compile TypeScript to dist/
npm run build
```

Output is written to `dist/`. The entry point is `dist/index.js`.

To verify the build before deploying:

```bash
node dist/index.js
```

---

## Environment Variables

All configuration is loaded from environment variables. See [ENVIRONMENT.md](./ENVIRONMENT.md) for the full reference.

The minimum required variables to start the server:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/authcore
JWT_ACCESS_SECRET=<min 32 chars>
JWT_REFRESH_SECRET=<min 32 chars>
```

Generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run the above command twice — once for `JWT_ACCESS_SECRET`, once for `JWT_REFRESH_SECRET`. Use different values for each.

---

## Running in Production

### Direct (no Docker)

```bash
NODE_ENV=production node dist/index.js
```

### With environment file

```bash
NODE_ENV=production node -r dotenv/config dist/index.js
```

---

## Docker

### Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### Build and run

```bash
# Build image
docker build -t authcore-backend:latest .

# Run container
docker run -d \
  --name authcore \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_ACCESS_SECRET="..." \
  -e JWT_REFRESH_SECRET="..." \
  authcore-backend:latest
```

### View logs

```bash
docker logs -f authcore
```

---

## Docker Compose

For a full local production stack (app + MongoDB):

```yaml
# docker-compose.yml
version: "3.9"

services:
  app:
    build: .
    container_name: authcore-app
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://mongo:27017/authcore
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      JWT_ACCESS_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - authcore-net

  mongo:
    image: mongo:6
    container_name: authcore-mongo
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - authcore-net

networks:
  authcore-net:
    driver: bridge

volumes:
  mongo-data:
```

```bash
# Copy secrets to .env first
echo "JWT_ACCESS_SECRET=$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")" >> .env
echo "JWT_REFRESH_SECRET=$(node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")" >> .env

# Start the stack
docker compose up -d

# Stop
docker compose down
```

---

## Reverse Proxy — Nginx

In production, place Nginx in front of the Node.js server. This handles TLS termination, rate limiting, and hides the internal port.

```nginx
# /etc/nginx/sites-available/authcore
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Node.js
    location /api/ {
        proxy_pass         http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Important: forward cookies
        proxy_pass_header  Set-Cookie;
    }

    # Rate limiting (adjust as needed)
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    location /api/v1/auth/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/authcore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### TLS with Let's Encrypt

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

## MongoDB in Production

### MongoDB Atlas (recommended)

1. Create a free-tier cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with readWrite access
3. Add your server IP to the IP allowlist
4. Copy the connection string: `mongodb+srv://user:pass@cluster.xyz.mongodb.net/authcore`
5. Set it as `MONGODB_URI`

### Self-hosted MongoDB

```bash
# Install MongoDB 6 on Ubuntu
curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

**Always enable authentication on self-hosted MongoDB.** The default install has no auth.

```bash
# Create admin user
mongosh --eval "db.adminCommand({createUser: 'authcore', pwd: 'strongpassword', roles: [{role: 'readWrite', db: 'authcore'}]})"
```

### Indexes

All Mongoose indexes are created automatically when the app starts (via Mongoose's `syncIndexes`). No manual migration is needed on first deploy.

---

## Health Check

Add a health endpoint to your Express app for load balancer and container orchestration checks:

```typescript
// In src/index.ts
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

Docker healthcheck in `docker-compose.yml`:

```yaml
app:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

## Process Management — PM2

For a non-Docker VPS deployment:

```bash
npm install -g pm2

# Start
pm2 start dist/index.js --name authcore --env production

# Auto-restart on crash, start on reboot
pm2 startup
pm2 save

# Logs
pm2 logs authcore

# Monitor
pm2 monit

# Restart after deploy
pm2 restart authcore
```

PM2 ecosystem file (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [{
    name:      "authcore",
    script:    "dist/index.js",
    instances: "max",           // one per CPU core
    exec_mode: "cluster",
    env_production: {
      NODE_ENV: "production",
      PORT: 5000,
    },
    error_file: "logs/error.log",
    out_file:   "logs/out.log",
    time:       true,
  }],
};
```

```bash
pm2 start ecosystem.config.js --env production
```

---

## Deployment Checklist

Run through this before every production deployment:

### Environment
- [ ] `NODE_ENV` is set to `production`
- [ ] `JWT_ACCESS_SECRET` is at least 32 random characters
- [ ] `JWT_REFRESH_SECRET` is at least 32 random characters and **different** from the access secret
- [ ] `MONGODB_URI` points to production database (not local/dev)
- [ ] No `.env` file is committed to the repository

### Build
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` completes without errors
- [ ] `dist/` directory exists and contains `index.js`

### Security
- [ ] HTTPS is configured — cookies use `secure: true` in production
- [ ] MongoDB authentication is enabled
- [ ] MongoDB IP allowlist is restricted to application server IP only
- [ ] `passwordHash` field is `select: false` in the User schema
- [ ] `refreshToken` field is `select: false` in the Session schema (tokens never appear in API responses)

### Infrastructure
- [ ] Reverse proxy is configured and forwarding cookies correctly
- [ ] Health endpoint responds `200`
- [ ] Process manager (PM2 or Docker) is configured to restart on crash
- [ ] Log rotation is configured
- [ ] Database backups are scheduled (MongoDB Atlas does this automatically)
