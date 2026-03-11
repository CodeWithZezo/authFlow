import { Response } from "express";
import { OrgService } from "./org.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class OrgController {
  private orgService: OrgService;

  constructor(orgService?: OrgService) {
    this.orgService = orgService ?? new OrgService();
  }

  // ─── Organization CRUD ──────────────────────────────────────────────────────

  createOrg = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.createOrg(req.body, req.user!.userId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getOrg = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.getOrg(req.params.orgId, req.user!.userId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updateOrg = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.updateOrg(req.params.orgId, req.body);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  deleteOrg = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.deleteOrg(req.params.orgId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // ─── Organization Members ───────────────────────────────────────────────────

  getOrgMembers = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.getOrgMembers(req.params.orgId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  addOrgMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.addOrgMember(req.params.orgId, req.body);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  getOrgMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.getOrgMember(req.params.orgId, req.params.userId);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  updateOrgMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.updateOrgMember(
        req.params.orgId,
        req.params.userId,
        req.body
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  removeOrgMember = async (req: AuthRequest, res: Response) => {
    try {
      const { status, body } = await this.orgService.removeOrgMember(
        req.params.orgId,
        req.params.userId
      );
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}
