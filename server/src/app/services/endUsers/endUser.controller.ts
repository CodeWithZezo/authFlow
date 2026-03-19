import { Request, Response } from "express";
import { EndUserService } from "./endUser.service";
import { ResolvedRequest } from "../../middleware/endUser.middleware";

export class EndUserController {
  private userService = new EndUserService();

  signup = async (req: Request, res: Response) => {
    try {
      const context = (req as ResolvedRequest).context;
      const result = await this.userService.signupService(req.body, context) as any;
      this.setTokenCookies(res, result?.accessToken, result?.refreshToken);
      return res.status(result.status).json(result.body);
    } catch (err: any) {
      console.error("Signup Error:", err);
      return res.status(500).json({ message: "Internal Server Error", errors: [err.message || "Unknown error"] });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const context = (req as ResolvedRequest).context;
      const result = await this.userService.loginService(req.body, context) as any;
      this.setTokenCookies(res, result?.accessToken, result?.refreshToken);
      return res.status(result.status).json(result.body);
    } catch (err: any) {
      console.error("Login Error:", err);
      return res.status(500).json({ message: "Internal Server Error", errors: [err.message || "Unknown error"] });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const context = (req as ResolvedRequest).context;
      const user = (req as any).user;
      const result = await this.userService.logOutService(user, context);
      return res.status(result.status).json(result.body);
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error", errors: ["Internal Server Error"] });
    }
  };

  private setTokenCookies(res: Response, accessToken?: string, refreshToken?: string) {
    const secure = process.env.NODE_ENV === "production";
    if (accessToken) res.cookie("accessToken", accessToken, { httpOnly: true, secure, sameSite: "strict", maxAge: 15 * 60 * 1000 });
    if (refreshToken) res.cookie("refreshToken", refreshToken, { httpOnly: true, secure, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
  }
}