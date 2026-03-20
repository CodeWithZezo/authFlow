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
    const { fullName, email, password, phone, avatarUrl } = data;

    if (!password) {
      return { status: 400, body: { message: "Invalid password", errors: ["Password is required"] } };
    }

    const passwordValidation = PasswordUtils.validate(password);
    if (!passwordValidation.valid) {
      return { status: 400, body: { message: "Invalid password", errors: passwordValidation.errors } };
    }

    const passwordHash = await PasswordUtils.hash(password);

    try {
      const user: IUser = await User.create({
        fullName,
        email: email.toLowerCase().trim(),
        phone: phone ? phone.toString() : null,
        passwordHash,
        isVerified: false,
        avatarUrl: avatarUrl ?? null,
      });

      const { accessToken, refreshToken } = this.generateTokens(user as any);
      await Session.create({ userId: user._id, refreshToken });

      return {
        status: 201,
        body: {
          message: "User created successfully",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            avatarUrl: user.avatarUrl ?? undefined,
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

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select("+passwordHash +avatarKey")
      .lean() as (IUser & { avatarKey?: string | null }) | null;

    if (!user) {
      return { status: 404, body: { message: "User not found" } };
    }

    const isPasswordMatched = await PasswordUtils.compare(password, user.passwordHash);
    if (!isPasswordMatched) {
      return { status: 401, body: { message: "Invalid credentials" } };
    }

    const { accessToken, refreshToken } = this.generateTokens(user as any);
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
          avatarUrl: user.avatarKey
            ? `/api/v1/auth/avatar/${user._id}`
            : user.avatarUrl ?? undefined,
        },
        accessToken,
        refreshToken,
      },
    };
  }

  // ─── Current User ──────────────────────────────────────────────────────────
  // FIX: single query — select +avatarKey explicitly, no second round-trip
  async currentUser(
    req: AuthRequest
  ): Promise<IServiceResponse<{ message: string; user?: any }>> {
    try {
      const user = await User.findById(req.user?.userId)
        .select("-passwordHash -privateMetadata +avatarKey")
        .lean() as any;

      if (!user) {
        return { status: 404, body: { message: "User not found" } };
      }

      const { avatarKey, ...safeUser } = user;

      return {
        status: 200,
        body: {
          message: "User fetched successfully",
          user: {
            ...safeUser,
            avatarUrl: avatarKey
              ? `/api/v1/auth/avatar/${user._id}`
              : user.avatarUrl ?? null,
          },
        },
      };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────────────────────
  async refreshToken(req: AuthRequest): Promise<IServiceResponse<any>> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;

      if (!incomingRefreshToken) {
        return { status: 401, body: { message: "Refresh token missing" } };
      }

      let payload: { userId: string; email: string } | null = null;
      try {
        payload = JWTUtils.verifyRefreshToken(incomingRefreshToken) as { userId: string; email: string };
      } catch {
        return { status: 401, body: { message: "Invalid or expired refresh token" } };
      }

      if (!payload) {
        return { status: 401, body: { message: "Invalid or expired refresh token" } };
      }

      // Atomic: find session and user in parallel
      const [session, user] = await Promise.all([
        Session.findOne({ userId: payload.userId, refreshToken: incomingRefreshToken }).lean(),
        User.findById(payload.userId).lean(),
      ]);

      if (!session) {
        return { status: 401, body: { message: "Session not found or already revoked" } };
      }
      if (!user) {
        return { status: 404, body: { message: "User not found" } };
      }

      // Rotate: delete old session, create new one
      await Session.deleteOne({ _id: session._id });
      const { accessToken, refreshToken } = this.generateTokens(user as any);
      await Session.create({ userId: user._id, refreshToken });

      return {
        status: 200,
        body: {
          message: "Token refreshed successfully",
          user: { id: user._id, fullName: user.fullName, email: user.email },
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
  async logout(req: AuthRequest): Promise<IServiceResponse<{ message: string }>> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken;
      if (incomingRefreshToken) {
        await Session.deleteOne({ userId: req.user?.userId, refreshToken: incomingRefreshToken });
      }
      return { status: 200, body: { message: "Logged out successfully" } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  // ─── Change Password ────────────────────────────────────────────────────────
  requestPasswordReset = async (
    newPassword: string,
    email: string | undefined,
    currentPassword: string
  ): Promise<IServiceResponse<{ message: string; errors?: any }>> => {
    try {
      if (!email) {
        return { status: 400, body: { message: "Email is required" } };
      }
      const user = await User.findOne({ email }).select("+passwordHash").lean() as IUser | null;
      if (!user) {
        return { status: 404, body: { message: "User not found" } };
      }

      const isCurrentPasswordValid = await PasswordUtils.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return { status: 401, body: { message: "Current password is incorrect" } };
      }

      const passwordValidation = PasswordUtils.validate(newPassword);
      if (!passwordValidation.valid) {
        return { status: 400, body: { message: "Invalid password", errors: passwordValidation.errors } };
      }

      const passwordHash = await PasswordUtils.hash(newPassword);
      await User.updateOne({ _id: user._id }, { $set: { passwordHash } });

      return { status: 200, body: { message: "Password changed successfully" } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  };

  // ─── Private Helpers ───────────────────────────────────────────────────────
  private generateTokens(user: IUser) {
    const payload = { userId: user._id.toString(), email: user.email };
    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload),
    };
  }
}