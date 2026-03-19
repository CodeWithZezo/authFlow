import { Response } from "express";
import { ProjectPolicyService } from "./projectPolicy.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class ProjectPolicyController {
  private projectPolicyService: ProjectPolicyService;

  constructor(projectPolicyService?: ProjectPolicyService) {
    this.projectPolicyService = projectPolicyService ?? new ProjectPolicyService();
  }

  createPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectPolicyService.createPolicy(
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectPolicyService.getPolicy(
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updatePolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectPolicyService.updatePolicy(
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  deletePolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.projectPolicyService.deletePolicy(
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
