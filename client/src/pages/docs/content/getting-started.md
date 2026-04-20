# Getting Started

Hey, welcome! This guide is going to walk you through setting up AuthFlow from scratch. By the end of it, you'll have a running server, a connected frontend, and a solid understanding of how the whole thing fits together. Let's go.

---

## What is AuthFlow, exactly?

AuthFlow is a full-stack authentication platform. Think of it like building your own mini Firebase Auth — you get organizations, projects, and end-users, all managed through a clean REST API.

Here's the core mental model you need to hold onto:

```
Organization
  └── Project
        └── End Users (the people who sign up to your app)
```

- An **Organization** is the top-level container. Think of it as your company or team.
- A **Project** lives inside an org. This represents a specific app you're building (like a mobile app, a SaaS product, etc.).
- **End Users** are the real users of *your* app. They sign up through your project and never touch the dashboard.

Got that? Good. Let's get it running.

---

## What you'll need before starting

Make sure you have these installed:

- **Node.js** v18 or higher — [download here](https://nodejs.org)
- **MongoDB** v6 or higher — local install or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **An AWS S3 bucket** — for avatar storage (you can skip this for now if you just want to test, but you'll need it for avatars)

Not sure which Node version you have? Run this:

```bash
node -v
```

If it's below 18, grab the latest from nodejs.org.

---

## Step 1 — Clone and install

Start by cloning the repo and installing dependencies for both the server and client:

```bash
git clone https://github.com/your-org/authflow.git
cd authflow

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

This will take a minute. Grab a coffee.

---

## Step 2 — Set up your environment variables

The server needs a `.env` file to know where your database is, what secrets to use for tokens, and where your S3 bucket lives.

Create a file at `server/.env` and paste this in:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/authflow
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
CORS_ORIGIN=http://localhost:5173
```

A couple of things to note here:

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` should be long, random strings. Something like `openssl rand -base64 64` will generate a good one.
- `JWT_ACCESS_EXPIRY=15m` means access tokens expire every 15 minutes. The app handles refreshing them automatically, so you don't need to worry about this.
- If you're on MongoDB Atlas, replace the `MONGODB_URI` with your Atlas connection string.

---

## Step 3 — Start everything up

Open two terminal windows (or tabs).

**Terminal 1 — start the server:**

```bash
cd server
npm run dev
```

You should see something like:
```
Server running on port 5000
MongoDB connected
```

**Terminal 2 — start the client:**

```bash
cd client
npm run dev
```

The client will be available at **http://localhost:5173** and the server at **http://localhost:5000**.

---

## Step 4 — Create your first account

Head to `http://localhost:5173` and sign up for an account. This creates you as an admin/dashboard user — not an end-user. Think of it as your developer account that controls everything.

From here, you'll be able to create organizations, projects, configure policies, and manage end-users through the dashboard.

---

## What's next?

Now that you're up and running, here's the recommended order to follow:

1. **Create an Organization** — this is your first step after signing up. See [Organizations](/docs/organizations).
2. **Create a Project** inside that org — this is where your end-users will live. See [Projects](/docs/projects).
3. **Configure Policies** — you need a password policy and a project policy before end-users can sign up. See [Policies](/docs/policies).
4. **Let end-users sign up** — once the policies are in place, your signup endpoint is ready. See [End Users](/docs/end-users).

You can also jump to [Authentication](/docs/authentication) if you want to understand how the token system works under the hood before going further.