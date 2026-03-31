# Getting Started

Welcome to **AuthFlow** — a full-stack authentication platform for managing organizations, projects, and end-users.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or Atlas)
- **AWS S3** bucket (for avatar storage)

## Installation

Clone the repository and install dependencies for both client and server.

```bash
git clone https://github.com/your-org/authflow.git
cd authflow

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

## Environment Setup

Create a `.env` file in the `server/` directory:

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

## Running the App

```bash
# Start server (from /server)
npm run dev

# Start client (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:5000`.

## Quick Overview

AuthFlow has a **3-tier hierarchy**:

| Level | Description |
|-------|-------------|
| **Organization** | Top-level entity, has members with roles |
| **Project** | Belongs to an org, has its own policy and end-users |
| **End User** | Scoped to a project, authenticated via project policy |

## Next Steps

1. Create an **Organization** → see [Organizations](/docs/organizations)
2. Create a **Project** inside it → see [Projects](/docs/projects)
3. Configure a **Password Policy** and **Project Policy** → see [Policies](/docs/policies)
4. Your end-users can now **signup and login** → see [End Users](/docs/end-users)
