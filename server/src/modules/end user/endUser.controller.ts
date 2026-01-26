import { Request, Response } from "express";
import { EndUserService } from "./endUser.service";

export class EndUserController {
  private userService: EndUserService;
  constructor() {
    this.userService = new EndUserService();
  }
  async signup(req:Request  , res: Response) {
    try {
      const { status, body } = await this.userService.signupService(req);
      return res.status(status).json(body);
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  }
}
