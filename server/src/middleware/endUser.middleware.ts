import { NextFunction, Request, Response } from "express";
import { Project } from "../models/schema/project.schema";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";
import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";
import { getProjectWithPolicy } from "../utils/endUser.utils";

export interface ResolvedRequest extends Request {
  context: {
    project: any;
    projectPolicy: any;
    passwordPolicy?: any;
  };
}

export const resolveProjectContext = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId || !/^[a-f\d]{24}$/i.test(projectId))
      return res.status(400).json({ message: "Invalid or missing project ID" });

    const context = await getProjectWithPolicy(projectId);

    if (!context || !context.project)
      return res.status(404).json({ message: "Project not found" });

    // Attach context safely; projectPolicy and passwordPolicy can be null
    (req as any).context = context;

    next();
  } catch (err) {
    next(err);
  }
};

export const RoleAuthorize = (requiredRole: string) => {
  return async (req: ResolvedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.context || !req.context.project) {
        return res.status(400).json({ message: "Project context is missing" });
      }
      const { projectPolicy } = req.context;
      if (!projectPolicy || !projectPolicy.roles) {
        return res.status(403).json({ message: "Access denied: No roles defined" });
      }
      const userRoles = projectPolicy.roles; // Assuming this is an array of roles assigned to the user
      if (!userRoles.includes(requiredRole)) {
        return res.status(403).json({ message: "Access denied: Insufficient role" });
      }
      next();
    } catch (error) {
      next(error);
    }
  }

}