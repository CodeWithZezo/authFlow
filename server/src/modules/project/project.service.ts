import Project from "../../models/models.types";

class ProjectService {
    createProject = async (projectData: any) => {
        try {
            const project = await Project.create(projectData);
            return project;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default ProjectService;