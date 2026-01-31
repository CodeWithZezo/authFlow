import { Request, Response, NextFunction } from "express";
import { JWTUtils } from "../utils/jwt.utils";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        status: 401,
        body: {
          message: "Not authenticated",
          errors: ["Not authenticated"],
        },
      });
    }

    // Remove "Bearer " if present
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    const payload = JWTUtils.verifyAccessToken(token) as {
      userId: string;
      email: string;
    };

    if (!payload) {
      return res.status(401).json({
        status: 401,
        body: {
          message: "Invalid token",
          errors: ["Invalid token"],
        },
      });
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({
      status: 401,
      body: {
        message: "Unauthorized",
        errors: ["Unauthorized"],
      },
    });
  }
};
