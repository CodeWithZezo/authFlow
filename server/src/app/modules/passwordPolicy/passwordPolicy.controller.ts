import { Response } from "express";
import { PasswordPolicyService } from "./passwordPolicy.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class PasswordPolicyController {
  private passwordPolicyService: PasswordPolicyService;

  constructor(passwordPolicyService?: PasswordPolicyService) {
    this.passwordPolicyService = passwordPolicyService ?? new PasswordPolicyService();
  }

  createPasswordPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.passwordPolicyService.createPasswordPolicy(
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getPasswordPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.passwordPolicyService.getPasswordPolicy(
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updatePasswordPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.passwordPolicyService.updatePasswordPolicy(
        req.params.projectId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  deletePasswordPolicy = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.passwordPolicyService.deletePasswordPolicy(
        req.params.projectId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
