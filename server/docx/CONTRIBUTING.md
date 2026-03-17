# Contributing to AuthCore

Thank you for your interest in contributing. This document explains how to set up the project, the conventions every contributor must follow, and how to submit changes.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Module Pattern](#module-pattern)
- [Adding a New Endpoint](#adding-a-new-endpoint)
- [Adding a New Module](#adding-a-new-module)
- [Error Handling Rules](#error-handling-rules)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Known Issues](#known-issues)

---

## Development Setup

### Prerequisites

- Node.js 18+
- MongoDB 6+ running locally (or a MongoDB Atlas URI)
- npm

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd authcore-backend
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env — minimum required: MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

# 3. Start dev server (hot reload)
npm run dev
```

The server starts on `http://localhost:5000` by default. All routes are prefixed `/api/v1`.

### Running type checks

```bash
npx tsc --noEmit
```

---

## Project Conventions

### File naming

All files use `camelCase`. Each module lives in its own folder under `src/`:

```
src/<module>/
    <module>.controller.ts
    <module>.service.ts
    <module>.route.ts
```

### Class naming

- Controllers: `export class UserController`
- Services:    `export class UserService`

### Constructor injection

Every controller accepts an optional service instance to allow dependency injection in tests:

```typescript
export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService ?? new UserService();
  }
}
```

### Controller shape

Controllers only handle HTTP — they never contain business logic:

```typescript
someAction = async (req: AuthRequest, res: Response) => {
  try {
    const { status, body } = await this.someService.someAction(req.body);
    return res.status(status).json(body);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
```

### Service return type

Every service method **must** return `Promise<IServiceResponse<T>>`:

```typescript
import { IServiceResponse } from "../../types/auth.types";

async doSomething(data: InputType): Promise<IServiceResponse<any>> {
  try {
    // ... business logic
    return { status: 200, body: { message: "Success", result } };
  } catch (error: any) {
    if (error.code === 11000) {
      return { status: 409, body: { message: "Duplicate resource" } };
    }
    logger.error("ClassName.methodName", error);
    return { status: 500, body: { message: "Internal server error" } };
  }
}
```

### Logging

Use the project logger — never use `console.log` in services (only in controllers for uncaught errors):

```typescript
import { logger } from "../../utils/logger";

logger.info("UserService.signup - user created", { userId });
logger.error("UserService.signup", error);
logger.warn("UserService.login - failed attempt", { email });
```

The logger format: `[LEVEL] ISO_TIMESTAMP - message meta`

Debug logs only emit in `NODE_ENV=development`.

### MongoDB duplicate key errors

Always catch error code `11000` and return a `409` — never let it bubble as a 500:

```typescript
} catch (error: any) {
  if (error.code === 11000) {
    return { status: 409, body: { message: "Resource already exists" } };
  }
  logger.error("ClassName.methodName", error);
  return { status: 500, body: { message: "Internal server error" } };
}
```

### Response body keys

These keys are fixed — do not rename them:

| Resource          | Success key        |
|-------------------|--------------------|
| Auth user         | `user`             |
| Organization      | `org`              |
| Org membership    | `membership`       |
| Members list      | `members`          |
| Project           | `project`          |
| Projects list     | `projects`         |
| Project membership| `membership`       |
| Project policy    | `policy`           |
| Password policy   | `passwordPolicy`   |
| Session           | `session`          |
| Sessions list     | `sessions`         |

### Authentication middleware

Protected routes must use `authenticate` from `auth.middleware.ts`. After it runs, `req.user` contains `{ userId: string, email: string }`.

Role-protected routes add `roleAuthorize(minRole, type)` after `authenticate`:

```typescript
// Requires at least "admin" role in the organization
router.patch("/:orgId", authenticate, roleAuthorize("admin", "organization"), controller.updateOrg);

// Requires at least "member" role in the project
router.get("/:projectId/members", authenticate, roleAuthorize("member", "project"), controller.getMembers);
```

---

## Module Pattern

Every module follows this exact pattern:

### 1. Route file

```typescript
import { Router } from "express";
import { FooController } from "./foo.controller";
import { authenticate, roleAuthorize } from "../../middleware/auth.middleware";
import cookieParser from "cookie-parser";

const router = Router();
const fooController = new FooController();

router.use(cookieParser());

router.post("/",        authenticate, roleAuthorize("admin", "organization"), fooController.createFoo);
router.get("/:fooId",   authenticate, roleAuthorize("member", "organization"), fooController.getFoo);
router.patch("/:fooId", authenticate, roleAuthorize("admin", "organization"),  fooController.updateFoo);
router.delete("/:fooId",authenticate, roleAuthorize("owner", "organization"),  fooController.deleteFoo);

export default router;
```

### 2. Controller file

```typescript
import { Response } from "express";
import { FooService } from "./foo.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class FooController {
  private fooService: FooService;

  constructor(fooService?: FooService) {
    this.fooService = fooService ?? new FooService();
  }

  createFoo = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.fooService.createFoo(req.body, req.user!.userId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
```

### 3. Service file

```typescript
import { IServiceResponse } from "../../types/auth.types";
import { logger } from "../../utils/logger";

export class FooService {
  async createFoo(data: ICreateFooRequest, userId: string): Promise<IServiceResponse<any>> {
    try {
      const foo = await Foo.create({ ...data, createdBy: userId });
      return { status: 201, body: { message: "Foo created successfully", foo } };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 409, body: { message: "Foo already exists" } };
      }
      logger.error("FooService.createFoo", error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
}
```

---

## Adding a New Endpoint

1. Add the route definition to the module's `.route.ts` with appropriate middleware
2. Add the controller method (arrow function, not a class method) to `.controller.ts`
3. Add the service method returning `IServiceResponse<T>` to `.service.ts`
4. Mount it in `src/index.route.ts` if it's a new top-level path
5. Document it in `swagger/paths/<module>.yml`

---

## Adding a New Module

1. Create `src/<module>/` with the three files
2. Register it in `src/index.route.ts`:
   ```typescript
   import fooRouter from "./foo/foo.route";
   router.use("/foos", fooRouter);
   ```
3. Add the Mongoose schema to `src/models/schema/<module>.schema.ts`
4. Add the TypeScript interface to `src/models/models.types.ts`
5. Create `swagger/paths/<module>.yml` and add the paths to `swagger/swagger.yml`

---

## Error Handling Rules

| Situation                           | Status | Message pattern                          |
|-------------------------------------|--------|------------------------------------------|
| Missing required fields             | 400    | `"Field X is required"`                  |
| Invalid field value                 | 400    | Descriptive validation message           |
| Missing or invalid auth cookie      | 401    | `"Not authenticated"` / `"Unauthorized"` |
| Insufficient role                   | 403    | `"Forbidden"`                            |
| Resource not found                  | 404    | `"X not found"`                          |
| Duplicate (MongoDB code 11000)      | 409    | `"X already exists"`                     |
| Unhandled exception                 | 500    | `"Internal server error"`                |

Never expose stack traces, raw MongoDB errors, or internal paths in responses.

---

## Commit Messages

Follow the Conventional Commits format:

```
<type>(<scope>): <short description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
```
feat(org): add removeOrgMember endpoint
fix(auth): normalize _id to id in fetchMe response
docs(swagger): add password-policy paths
refactor(project): extract member queries to service
```

---

## Pull Request Process

1. Branch from `main` using the format `feat/<name>`, `fix/<name>`, or `docs/<name>`
2. Keep PRs focused — one feature or fix per PR
3. Ensure `npx tsc --noEmit` passes with no type errors
4. Update the relevant `swagger/paths/*.yml` file for any endpoint changes
5. Add a clear description of what changed and why
6. Request a review before merging

---

## Known Issues

| File | Issue | Status |
|------|-------|--------|
| `src/utils/user.utils.ts` | `findProjectsByUserId` queries `Organization` model instead of `Project` | Bug — open |
| `src/middleware/auth.middleware.ts` | `roleAuthorize` compares `membership.role` against `user.userId` instead of a role hierarchy — RBAC is currently not enforced correctly | Bug — open |
| `src/models/enums.ts` | `AuthType.TWO_FACTOR` is `"2fa"` in enums but services use `"two_factor"` | Inconsistency — open |
| `src/models/schema/user.schema.ts` | `privateMetadata` has `select: false` omitted — it is returned by default on `/me` | Open |
