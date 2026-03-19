import { Response } from "express";
import { ProjectService } from "./project.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class ProjectController {
  private projectService: ProjectService;

  constructor(projectService?: ProjectService) {
    this.projectService = projectService ?? new ProjectService();
  }

  // ─── Project CRUD ───────────────────────────────────────────────────────────

  createProject = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.createProject(
        req.params.orgId,
        req.body,
        req.user!.userId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getProjects = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.getProjects(req.params.orgId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getProject = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.getProject(
        req.params.orgId,
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updateProject = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.updateProject(
        req.params.orgId,
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteProject = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.deleteProject(
        req.params.orgId,
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── Project Members ────────────────────────────────────────────────────────

  addProjectMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.addProjectMember(
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getProjectMembers = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.getProjectMembers(
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getProjectMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.getProjectMember(
        req.params.projectId,
        req.params.userId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updateProjectMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.updateProjectMember(
        req.params.projectId,
        req.params.userId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  removeProjectMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectService.removeProjectMember(
        req.params.projectId,
        req.params.userId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
