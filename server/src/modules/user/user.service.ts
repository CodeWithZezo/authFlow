import { User } from "../../models/schema/user.schema";
import { Session } from "../../models/schema/session.schema";
import { JWTUtils } from "../../utils/jwt.utils";
import { PasswordUtils } from "../../utils/password.utils";
import {
  ISignupRequest,
  ILoginRequest,
  AuthResponse,
  IServiceResponse,
} from "../../types/auth.types";
import { IUser } from "../../models/models.types";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UserService {

  // ─── Signup ────────────────────────────────────────────────────────────────
  async signup(
    data: ISignupRequest
  ): Promise<IServiceResponse<AuthResponse | { message: string; errors?: any }>> {
    const { fullName, email, password, phone } = data;

    const passwordValidation = PasswordUtils.validate(password);
    if (!passwordValidation.valid) {
      return {
        status: 400,
        body: { message: "Invalid password", errors: passwordValidation.errors },
      };
    }

    const passwordHash = await PasswordUtils.hash(password);

    try {
      const user: IUser = await User.create({
        fullName,
        email: email.toLowerCase().trim(),
        phone: phone ? phone.toString() : null,
        passwordHash,
        isVerified: false,
      });

      const { accessToken, refreshToken } = this.generateTokens(user);

      await Session.create({ userId: user._id, refreshToken });

      return {
        status: 201,
        body: {
          message: "User created successfully",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone?.toString() ?? undefined,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 400, body: { message: "Email already exists" } };
      }
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(
    data: ILoginRequest
  ): Promise<IServiceResponse<AuthResponse | { message: string }>> {
    const { email, password } = data;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    ) as IUser | null;

    if (!user) {
      return { status: 404, body: { message: "User not found" } };
    }

    const isPasswordMatched = await PasswordUtils.compare(password, user.passwordHash);
    if (!isPasswordMatched) {
      return { status: 401, body: { message: "Invalid credentials" } };
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    await Session.create({ userId: user._id, refreshToken });

    return {
      status: 200,
      body: {
        message: "User logged in successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone?.toString() ?? undefined,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // ─── Current User ──────────────────────────────────────────────────────────
  async currentUser(
    req: AuthRequest
  ): Promise<IServiceResponse<{ message: string; user?: Partial<IUser> }>> {
    try {
      const user = await User.findById(req.user?.userId).select(
        "-passwordHash -privateMetadata"
      );

      if (!user) {
        return { status: 404, body: { message: "User not found" } };
      }

      return { status: 200, body: { message: "User fetched successfully", user } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────
  // FIX: validate incoming refresh token, delete old session, create new one
  async refreshToken(
    req: AuthRequest
  ): Promise<IServiceResponse<any>> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;

      if (!incomingRefreshToken) {
        return { status: 401, body: { message: "Refresh token missing" } };
      }

      const payload = JWTUtils.verifyRefreshToken(incomingRefreshToken) as {
        userId: string;
        email: string;
      } | null;

      if (!payload) {
        return { status: 401, body: { message: "Invalid or expired refresh token" } };
      }

      // Validate session exists in DB (prevents reuse of revoked tokens)
      const session = await Session.findOne({
        userId: payload.userId,
        refreshToken: incomingRefreshToken,
      });

      if (!session) {
        return { status: 401, body: { message: "Session not found or already revoked" } };
      }

      const user = await User.findById(payload.userId);
      if (!user) {
        return { status: 404, body: { message: "User not found" } };
      }

      // Rotate tokens — delete old session, create new one
      await Session.deleteOne({ _id: session._id });

      const { accessToken, refreshToken } = this.generateTokens(user);
      await Session.create({ userId: user._id, refreshToken });

      return {
        status: 200,
        body: {
          message: "Token refreshed successfully",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Logout ────────────────────────────────────────────────────────────────
  // FIX: delete session from DB on logout
  async logout(req: AuthRequest): Promise<IServiceResponse<{ message: string }>> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;

      if (incomingRefreshToken) {
        // Delete only the current session (single device logout)
        await Session.deleteOne({
          userId: req.user?.userId,
          refreshToken: incomingRefreshToken,
        });
      }

      return { status: 200, body: { message: "Logged out successfully" } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────
  private generateTokens(user: IUser) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
    };

    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload),
    };
  }
}
