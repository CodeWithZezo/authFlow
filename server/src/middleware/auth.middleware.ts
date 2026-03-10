import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../utils/jwt.utils";
import { Organization } from "../models/schema/org.schema";
import { Project } from "../models/schema/project.schema";
import { check } from "zod";
import { checkOrganizationMembershipByUserId, checkOrganizationMembershipByUserIdAndOrgId, checkProjectMembershipByUserIdAndProjectId } from "../utils/user.utils";

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
//here role for organization and project will be checked in the rbac middleware, and then the user will be authorized to perform a specific action based on their role in the organization or project. this is useful for checking if a user has the necessary permissions to perform a specific action in an organization or project.
export const roleAuthorize = (
  requriedRole: string,
  type: "organization" | "project",
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      let membership;
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
      if (type === "organization") {
        let orgId = req.params.orgId || req.body.orgId || req.query.orgId;
        if (!orgId) {
          return res.status(400).json({
            status: 400,
            body: {
              message: "Organization ID is required",
              errors: ["Organization ID is required"],
            },
          });
        }
        membership = await checkOrganizationMembershipByUserIdAndOrgId(user.userId, orgId);
      }

      if (type === "project") {
        let projectId =
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

        membership = await checkProjectMembershipByUserIdAndProjectId(user.userId, projectId);
      }

      if(!membership) {
        return res.status(404).json({
          status: 404,
          body: {
            message: "Resource not found",
            errors: ["Resource not found"],
          },
        });
      }
      if(membership.role.toString() !== user.userId) {
        return res.status(403).json({
          status: 403,
          body: {
            message: "Forbidden",
            errors: ["Forbidden"],
          },
        });
      }

    } catch (error) {
      console.log(error);
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
