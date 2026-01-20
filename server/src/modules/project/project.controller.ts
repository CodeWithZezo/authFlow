import ProjectService from "./project.service";
import { Request, Response } from "express";

const projectService = new ProjectService();

class ProjectController {
    createProject = async (req: Request, res: Response) => {
        try {
            const { name, organizationId, active, description } = req.body;
            const project = await projectService.createProject({
                name,
                organizationId,
                active,
                description,
            });
            res.status(201).json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create project" });
        }
    }
}

export default ProjectController;