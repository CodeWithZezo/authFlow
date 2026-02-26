import { NextFunction, Request, Response } from "express";
import { Project } from "../models/schema/project.schema";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";
import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";

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
    const project = await Project.findOne(
      { _id: projectId, status: "active" },
      { _id: 1, name: 1, organizationId: 1 }
    ).lean();
    if (!project) return res.status(404).json({ message: "Project not found" });

    const projectPolicy = await ProjectPolicy.findOne(
      { projectId: project._id },
      { _id: 1, authType: 1, roles: 1, statuses: 1, authMethods: 1, passwordPolicyId: 1 }
    ).lean();
    if (!projectPolicy) return res.status(500).json({ message: "Project policy not found" });

    let passwordPolicy;
    if (projectPolicy.authType === "password" && projectPolicy.passwordPolicyId) {
      passwordPolicy = await PasswordPolicy.findOne(
        { _id: projectPolicy.passwordPolicyId },
        { _id: 1, minLength: 1, requireNumbers: 1, requireUppercase: 1, requireSpecialChars: 1 }
      ).lean();
      if (!passwordPolicy) return res.status(500).json({ message: "Password policy not found" });
    }

    (req as ResolvedRequest).context = { project, projectPolicy, passwordPolicy };
    next();
  } catch (err) {
    next(err);
  }
};