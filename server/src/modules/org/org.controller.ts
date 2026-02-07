import { Request, Response } from "express";
import { OrgService } from "./org.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class OrgController {
    private orgService: OrgService;
    
      constructor(orgService?: OrgService) {
        this.orgService = orgService ?? new OrgService();
      }
    
    createOrgController = async(req: Request, res: Response) => {
       try {
        const {status, body } = await this.orgService.createOrg(req)
        res.status(status).json(body)
       } catch (error: any) {
        res.status(500).json({ message: error.message })
       }
    };

    getAllOrgController =async(req: AuthRequest, res: Response) => {
      try {
        const { status, body } = await this.orgService.getAllOrg(req);
        res.status(status).json(body);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
}
}