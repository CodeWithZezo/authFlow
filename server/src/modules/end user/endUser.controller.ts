import { Request, Response } from "express";
import { EndUserService } from "./endUser.service";
import { ResolvedRequest } from "../../middleware/endUser.middleware";

export class EndUserController {
  private userService: EndUserService;
  constructor() {
    this.userService = new EndUserService();
  }
  signup= async (req: Request, res: Response)=> {
    try {
      const context = (req as ResolvedRequest).context;
      const { status, body } = await this.userService.signupService(req.body, context);

      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  }
}
