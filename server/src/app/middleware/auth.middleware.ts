import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../utils/jwt.utils";
import { Organization } from "../models/schema/org.schema";
import { Project } from "../models/schema/project.schema";
import {
  checkOrganizationMembershipByUserIdAndOrgId,
  checkProjectMembershipByUserIdAndProjectId,
} from "../utils/user.utils";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        status: 401,
        body: {
          message: "Not authenticated",
          errors: ["Not authenticated"],
        },
      });
    }

    // Remove "Bearer " if present
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const payload = JWTUtils.verifyAccessToken(token) as {
      userId: string;
      email: string;
    };

    if (!payload) {
      return res.status(401).json({
        status: 401,
        body: {
          message: "Invalid token",
          errors: ["Invalid token"],
        },
      });
    }

    req.user = payload;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({
      status: 401,
      body: {
        message: "Unauthorized",
        errors: ["Unauthorized"],
      },
    });
  }
};
export const roleAuthorize = (
  requiredRoles: string | string[], // now can be a string or array of strings
  type: "organization" | "project",
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          status: 401,
          body: {
            message: "Not authenticated",
            errors: ["Not authenticated"],
          },
        });
      }

      let membership;
      if (type === "organization") {
        const orgId = req.params.orgId || req.body.orgId || req.query.orgId;
        if (!orgId) {
          return res.status(400).json({
            status: 400,
            body: {
              message: "Organization ID is required",
              errors: ["Organization ID is required"],
            },
          });
        }
        membership = await checkOrganizationMembershipByUserIdAndOrgId(
          user.userId,
          orgId,
        );
      } else if (type === "project") {
        const projectId =
          req.params.projectId || req.body.projectId || req.query.projectId;
        if (!projectId) {
          return res.status(400).json({
            status: 400,
            body: {
              message: "Project ID is required",
              errors: ["Project ID is required"],
            },
          });
        }
        membership = await checkProjectMembershipByUserIdAndProjectId(
          user.userId,
          projectId,
        );
      }

      if (!membership) {
        return res.status(404).json({
          status: 404,
          body: {
            message: "Resource not found",
            errors: ["Resource not found"],
          },
        });
      }

      // Normalize to array
      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      if (!rolesArray.includes(membership.role.toString())) {
        return res.status(403).json({
          status: 403,
          body: {
            message: "Forbidden",
            errors: ["Forbidden"],
          },
        });
      }

      next(); // user has required role, proceed
    } catch (error) {
      console.error(error);
      res.status(403).json({
        status: 403,
        body: {
          message: "Forbidden",
          errors: ["Forbidden"],
        },
      });
    }
  };
};