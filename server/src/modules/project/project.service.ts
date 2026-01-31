import { Project } from "../../models/schema/project.schema";
import { ProjectMembership } from "../../models/schema/projectMembership.schema";
import { AuthType, Role, Status } from "../../models/enums";
import { Organization } from "../../models/schema/org.schema";
import mongoose from "mongoose";
import { PasswordPolicy } from "../../models/schema/passwordPolicy.schema";
import { ProjectPolicy } from "../../models/schema/projectPolicy.schema";
class ProjectService {
    

createProject = async (projectData: any) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(projectData.organizationId)) {
      return { status: 404, result: { error: "Organization not found" } };
    }

    const existingOrg = await Organization.findById(projectData.organizationId);
    if (!existingOrg) {
      return { status: 404, result: { error: "Organization not found" } };
    }

    const project = await Project.create({
      name: projectData.name,
      organizationId: projectData.organizationId,
      status: Status.ACTIVE,
      description: projectData.description,
    });

    try {
      const projectMembership = await ProjectMembership.create({
        projectId: project._id,
        userId: projectData.userId,
        role: Role.OWNER,
      });

      const passwordPolicy = await PasswordPolicy.create({
        projectId: project._id,
      });

      const projectPolicy = await ProjectPolicy.create({
        projectId: project._id,
        authType: AuthType.PASSWORD,
        passwordPolicyId: passwordPolicy._id,
      });

      return { status: 201, result: { project, projectMembership, projectPolicy, passwordPolicy } };
    } catch (err) {
      // Manual rollback
      await Project.findByIdAndDelete(project._id);
      throw err;
    }

  } catch (error: any) {
    if (error.code === 11000) {
      return {
        status: 400,
        result: { error: "Project already exists or change project name" },
      };
    }

    console.error(error);
    return { status: 500, result: { error: "Failed to create project" } };
  }
};

}

export default ProjectService;