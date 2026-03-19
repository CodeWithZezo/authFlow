import { EndUser } from "../../models/schema/endUser.schema";
import { User } from "../../models/schema/user.schema";
import { Session } from "../../models/schema/session.schema";
import { PasswordUtils } from "../../utils/password.utils";
import { JWTUtils } from "../../utils/jwt.utils";
import { findUserByEmailInProject, validateSignupAgainstProjectPolicy } from "../../utils/uinifiedSignupValidator";

export class EndUserService {

  signupService = async (body: any, context: any) => {
    const { project, projectPolicy, passwordPolicy } = context;

    if (!project || !projectPolicy) return { status: 404, body: { message: "Invalid credentials", errors: ["Invalid credentials"] } };

    const validation = validateSignupAgainstProjectPolicy(body, projectPolicy, passwordPolicy);
    if (!validation.valid) return { status: 400, body: { message: "Signup validation failed", errors: validation.errors } };

    const { fullName, email, password, phone, role, status } = body;

    const existing = await findUserByEmailInProject(email, project._id);
    if (existing) return { status: 400, body: { message: "User already exists", errors: ["User already exists"] } };

    const passwordHash = projectPolicy.authType === "password" ? await PasswordUtils.hash(password) : null;

    const user = await User.create({ fullName, email, passwordHash, phone });
    const endUser = await EndUser.create({ userId: user._id, projectId: project._id, role, status });
    const tokens = this.tokenResponse(user);
    await Session.create({ userId: user._id, refreshToken: tokens.refreshToken });

    return {
      status: 201,
      body: {
        message: "User created successfully",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: endUser.role,
          status: endUser.status,
          // No avatar yet on signup — null is correct
          avatarUrl: null,
        },
      },
      ...tokens,
    };
  };

  loginService = async (body: any, context: any) => {
    const { email, password } = body;
    const { project } = context;

    const existing = await findUserByEmailInProject(email, project._id);
    if (!existing) return { status: 404, body: { message: "User not found", errors: ["User not found"] } };

    const { user, endUser } = existing;
    const valid = await PasswordUtils.compare(password, user.passwordHash);
    if (!valid) return { status: 401, body: { message: "Invalid password", errors: ["Invalid password"] } };

    const tokens = this.tokenResponse(user);
    await Session.create({ userId: user._id, refreshToken: tokens.refreshToken });

    // Fetch avatarKey (select: false) to build streaming URL
    const avatarDoc = await User.findById(user._id).select("avatarKey").lean();

    return {
      status: 200,
      body: {
        message: "User logged in successfully",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: endUser.role,
          status: endUser.status,
          // Streaming URL — S3 URL never exposed
          avatarUrl: (avatarDoc as any)?.avatarKey
            ? `/api/v1/project/${project._id}/end-user/avatar/${user._id}`
            : null,
        },
      },
      ...tokens,
    };
  };

  logOutService = async (user: any, context: any) => {
    if (!user?.userId) return { status: 404, body: { message: "Invalid credentials", errors: ["Invalid credentials"] } };

    const session = await Session.findOne({ userId: user.userId });
    if (!session) return { status: 404, body: { message: "Session not found", errors: ["Session not found"] } };

    await session.deleteOne();
    return { status: 200, body: { message: "User logged out successfully" } };
  };

  private tokenResponse(user: any) {
    const payload = { userId: user._id.toString(), email: user.email };
    return {
      accessToken: JWTUtils.generateAccessToken(payload),
      refreshToken: JWTUtils.generateRefreshToken(payload),
    };
  }
}
