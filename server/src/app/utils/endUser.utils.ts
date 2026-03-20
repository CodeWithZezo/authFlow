import { PasswordPolicy } from "../models/schema/passwordPolicy.schema";
import { Project } from "../models/schema/project.schema";
import { ProjectPolicy } from "../models/schema/projectPolicy.schema";

interface ProjectContext {
  project: any;
  projectPolicy: any | null;
  passwordPolicy: any | null;
}

export const getProjectWithPolicy = async (projectId: string): Promise<ProjectContext | null> => {
  // FIX: fetch project + projectPolicy in parallel.
  // Then fetch passwordPolicy in the same parallel batch if we already know the ID —
  // but since passwordPolicyId lives inside projectPolicy, we can't avoid the waterfall
  // for the password policy alone. We minimise it by keeping the first two truly parallel.
  const [project, projectPolicy] = await Promise.all([
    Project.findOne(
      { _id: projectId, status: "active" },
      { _id: 1, name: 1, organizationId: 1 }
    ).lean(),
    ProjectPolicy.findOne(
      { projectId },
      { _id: 1, authType: 1, authRequired: 1, phoneRequired: 1, roles: 1, statuses: 1, authMethods: 1, passwordPolicyId: 1 }
    ).lean(),
  ]);

  if (!project) return null;

  // Fetch password policy only when needed (passwordPolicyId is known now)
  const passwordPolicy = projectPolicy?.passwordPolicyId
    ? await PasswordPolicy.findOne(
        { _id: projectPolicy.passwordPolicyId },
        { _id: 1, minLength: 1, requireNumbers: 1, requireUppercase: 1, requireSpecialChars: 1 }
      ).lean()
    : null;

  return { project, projectPolicy: projectPolicy ?? null, passwordPolicy };
};
