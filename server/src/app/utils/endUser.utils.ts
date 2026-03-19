import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";
import { Project } from "../models/schema/project.schema";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";

interface ProjectContext {
  project: any;
  projectPolicy: any | null;
  passwordPolicy: any | null;
}

export const getProjectWithPolicy = async (projectId: string): Promise<ProjectContext | null> => {
  const projectPromise = Project.findOne(
    { _id: projectId, status: "active" },
    { _id: 1, name: 1, organizationId: 1 }
  ).lean();

  const projectPolicyPromise = ProjectPolicy.findOne(
    { projectId },
    { _id: 1, authType: 1, roles: 1, statuses: 1, authMethods: 1, passwordPolicyId: 1 }
  ).lean();

  const [project, projectPolicy] = await Promise.all([projectPromise, projectPolicyPromise]);

  if (!project) return null; // Project not found

  let passwordPolicy = null;
  if (projectPolicy?.passwordPolicyId) {
    passwordPolicy = await PasswordPolicy.findOne(
      { _id: projectPolicy.passwordPolicyId },
      { _id: 1, minLength: 1, requireNumbers: 1, requireUppercase: 1, requireSpecialChars: 1 }
    ).lean();
  }

  return { project, projectPolicy: projectPolicy || null, passwordPolicy };
};