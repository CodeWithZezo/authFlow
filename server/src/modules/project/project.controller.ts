import ProjectService from "./project.service";
import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";

const projectService = new ProjectService();

class ProjectController {
    createProject = async (req: AuthRequest, res: Response) => {
        try {
            const { name, organizationId, description } = req.body;
            const user = req.user
            const {status, result} = await projectService.createProject({
                name,
                organizationId,
                description,
                userId: user?.userId,
            });
            res.status(status).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create project" });
        }
    }
}

export default ProjectController;