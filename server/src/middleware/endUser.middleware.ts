import { NextFunction, Request, Response } from "express";
import { Project } from "../models/schema/project.schema";
import { Status } from "../models/enums";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";
import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";
import { IPasswordPolicy, IProject, IProjectPolicy } from "../models/models.types";


interface ResolvedRequest extends Request {
  body: {
    context: {
      project: IProject;
      projectPolicy: IProjectPolicy;
      passwordPolicy: IPasswordPolicy;
    };
  };
}
export const resolveProjectContext = async (req:ResolvedRequest, res:Response, next:NextFunction) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      status: Status.ACTIVE
    }).lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found or inactive" });
    }

    const [projectPolicy, passwordPolicy] = await Promise.all([
      ProjectPolicy.findOne({ project_id: project._id }).lean(),
      PasswordPolicy.findOne({ project_id: project._id }).lean()
    ]);

    if (!projectPolicy || !passwordPolicy) {
      return res.status(500).json({ message: "Project policy or password policy not found" });
    }

    req.body.context = {
      project,
      projectPolicy,
      passwordPolicy
    };

    next();
  } catch (err) {
    next(err);
  }
};
