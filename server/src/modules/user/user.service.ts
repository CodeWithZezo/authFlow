import { User } from "../../models/schema/user.schema";
import { JWTUtils } from "../../utils/jwt.utils";
import { PasswordUtils } from "../../utils/password.utils";
import { ISignupRequest, ILoginRequest, AuthResponse, IServiceResponse } from "../../types/auth.types";
import { IUser } from "../../models/models.types";
import { Session } from "../../models/schema/session.schema";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UserService {

  async signup(data: ISignupRequest): Promise<IServiceResponse<AuthResponse | { message: string; errors?: any }>> {
    const { fullName, email, password, phone } = data;

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
        isVerified: false
      });


      const { accessToken, refreshToken } = this.tokenResponse(user);

      const session = await Session.create({
        userId: user._id,
        refreshToken,
      });

      return {
        status: 201,
        body: {
          message: "User created successfully",
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone?.toString() ?? undefined
          },
          accessToken,
          refreshToken
        }
      };

    } catch (error: any) {
      if (error.code === 11000) {
        return { status: 400, body: { message: "Email or Phone already exists" } };
      }
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  async login(data: ILoginRequest): Promise<IServiceResponse<AuthResponse | { message: string }>> {
    const { email, password } = data;

    // Explicitly select passwordHash
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash") as IUser;
    if (!user) return { status: 404, body: { message: "User not found" } };

    const isPasswordMatched = await PasswordUtils.compare(password, user.passwordHash);
    if (!isPasswordMatched) return { status: 401, body: { message: "Invalid credentials" } };

    const { accessToken, refreshToken } = this.tokenResponse(user);

    const session = await Session.create({
      userId: user._id,
      refreshToken,
    });

    return {
      status: 200,
      body: {
        message: "User logged in successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone
        },
        accessToken,
        refreshToken
      }
    };
  }

  async currentUser(req: AuthRequest) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return { status: 404, body: { message: "User not found" } };
      return { status: 200, body: { user } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }

  async refreshToken(req: AuthRequest) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return { status: 404, body: { message: "User not found" } };
      const { accessToken, refreshToken } = this.tokenResponse(user);
      return { status: 200, body: { user } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
  
  async logout(req: AuthRequest) {
    try {
      const user = await User.findById(req.user?.userId);
      if (!user) return { status: 404, body: { message: "User not found" } };
      return { status: 200, body: { user } };
    } catch (error) {
      console.error(error);
      return { status: 500, body: { message: "Internal server error" } };
    }
  }
  
  private tokenResponse(user: IUser) {
    const payload = {
      userId: user._id.toString(),
      email: user.email
    };

    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload)
    };
  }
  
}
