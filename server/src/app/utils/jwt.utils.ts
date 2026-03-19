import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { JWTPayload } from "../types/auth.types";
import { authConfig } from "../config/auth.config";

export class JWTUtils {
  static generateAccessToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: authConfig.jwt.accessTokenExpiry as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, authConfig.jwt.accessTokenSecret as Secret, options);
  }

  static generateRefreshToken(payload: JWTPayload): string {
    const options: SignOptions = {
      expiresIn: authConfig.jwt.refreshTokenExpiry as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, authConfig.jwt.refreshTokenSecret as Secret, options);
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, authConfig.jwt.accessTokenSecret as Secret) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, authConfig.jwt.refreshTokenSecret as Secret) as JWTPayload;
  }
}
