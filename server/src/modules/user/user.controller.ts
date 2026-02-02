import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService ?? new UserService();
  }

  signup = async (req: Request, res: Response) => { 
    try {
      const { status, body } = await this.userService.signup(req.body);

      // Set tokens in cookies if they exist
      if ('accessToken' in body && 'refreshToken' in body) {
        this.setTokenCookies(res, body.accessToken, body.refreshToken);
        // Remove tokens from response body
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

      // Set tokens in cookies if they exist
      if ('accessToken' in body && 'refreshToken' in body) {
        this.setTokenCookies(res, body.accessToken, body.refreshToken);
        // Remove tokens from response body
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
  }

  refreshToken =async (req:Request,res:Response)=>{ 
    try {
      const {status,body}=await this.userService.refreshToken(req)
      return res.status(status).json(body)
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  logout =async (req:Request,res:Response)=>{ 
    try {
      const {status,body}=await this.userService.logout(req)
      return res.status(status).json(body)
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  
  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });

    // Refresh token cookie - longer expiry
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
}