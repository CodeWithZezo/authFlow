import { Request, Response } from "express";
import { UserService } from "./user.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService ?? new UserService();
  }

  signup = async (req: Request, res: Response) => {
    try {
      const { status, body } = await this.userService.signup(req.body);

      if ("accessToken" in body && "refreshToken" in body) {
        this.setTokenCookies(res, body.accessToken, body.refreshToken);
        const { accessToken, refreshToken, ...responseBody } = body;
        return res.status(status).json(responseBody);
      }

      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { status, body } = await this.userService.login(req.body);

      if ("accessToken" in body && "refreshToken" in body) {
        this.setTokenCookies(res, body.accessToken, body.refreshToken);
        const { accessToken, refreshToken, ...responseBody } = body;
        return res.status(status).json(responseBody);
      }

      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }; 

  currentUser = async (req: Request, res: Response) => {
    try {
      const { status, body } = await this.userService.currentUser(req);
      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { status, body } = await this.userService.refreshToken(req);

      // FIX: set new tokens in cookies
      if ("accessToken" in body && "refreshToken" in body) {
        this.setTokenCookies(res, body.accessToken, body.refreshToken);
        const { accessToken, refreshToken, ...responseBody } = body;
        return res.status(status).json(responseBody);
      }

      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const { status, body } = await this.userService.logout(req);

      // FIX: clear cookies on logout
      this.clearTokenCookies(res);

      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

    requestPasswordReset = async (req: AuthRequest, res: Response) => {
    try {      
      const newPassword = req.body.newPassword;
      const email = req.user?.email;
      const currentPassword = req.body.currentPassword;
      
       if (!currentPassword) {
        return res.status(400).json({ message: "Current password is required" });
      }
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      const { status, body } = await this.userService.requestPasswordReset(newPassword, email, currentPassword);  
      return res.status(status).json(body);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
  }
}
