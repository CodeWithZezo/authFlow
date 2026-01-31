import { Request, Response } from "express";
import { EndUserService } from "./endUser.service";
import { ResolvedRequest } from "../../middleware/endUser.middleware";
import { AuthRequest } from "../../middleware/auth.middleware";

export class EndUserController {
  private userService: EndUserService;
  constructor() {
    this.userService = new EndUserService();
  }
  signup = async (req: Request, res: Response) => {
    try {
      const context = (req as ResolvedRequest).context;
      const { status, body, refreshToken, accessToken } =await this.userService.signupService(req.body, context);
      this.setTokenCookies(res, accessToken, refreshToken);
      return res.status(status).json({ body });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const context = (req as ResolvedRequest).context;
      const { status, refreshToken, accessToken, body } =await this.userService.loginService(req.body, context);
      this.setTokenCookies(res, accessToken, refreshToken);
      return res.status(status).json({ body });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        errors: ["Internal Server Error"],
      });
    }
  };

  logout =async (req: AuthRequest, res:Response) => {
    const context = (req as ResolvedRequest).context;
    const user = (req as AuthRequest).user;
    const { status, body } =await this.userService.logOutService(user, context);
    return res.status(status).json({ body });
  }

  private setTokenCookies(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
  ) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    // Refresh token cookie - longer expiry
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
