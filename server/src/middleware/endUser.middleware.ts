import { NextFunction, Request, Response } from "express";
import { Project } from "../models/schema/project.schema";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";
import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";
import { findPasswordPolicyByPasswordProjectId, findProjectByProjectId, findProjectPolicyByProjectId } from "../utils/user.utils";

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
    if (!projectId || !projectId.match(/^[a-f\d]{24}$/i))
      return res.status(400).json({ message: "Invalid or missing project ID" });

    // Fetch project and policy in parallel
    const project = await findProjectByProjectId(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const projectPolicy = await findProjectPolicyByProjectId(projectId);
    if (!projectPolicy) return res.status(500).json({ message: "Project policy not found" });

    let passwordPolicy;
    if (projectPolicy.authType === "password" && projectPolicy.passwordPolicyId) {
      passwordPolicy = await findPasswordPolicyByPasswordProjectId(projectPolicy.passwordPolicyId);
      if (!passwordPolicy) return res.status(500).json({ message: "Password policy not found" });
    }

    (req as ResolvedRequest).context = { project, projectPolicy, passwordPolicy };
    next();
  } catch (err) {
    next(err);
  }
};

export const RoleAuthorize = (requiredRole: string) => {
  return async (req: ResolvedRequest, res: Response, next: NextFunction) => {

  }

}