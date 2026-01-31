import { AuthType } from "../../models/enums";
import { IUser } from "../../models/models.types";
import { EndUser } from "../../models/schema/endUser.schema";
import { Session } from "../../models/schema/session.schema";
import { User } from "../../models/schema/user.schema";
import { JWTUtils } from "../../utils/jwt.utils";
import { PasswordUtils } from "../../utils/password.utils";
import {
  findUserByEmailInProject,
  validateSignupAgainstProjectPolicy,
} from "../../utils/uinifiedSignupValidator";

export class EndUserService {
  constructor() {}

  signupService = async (body: any, context: any) => {
    try {
      const { project, passwordPolicy, projectPolicy } = context;
      if (!project || !projectPolicy || !projectPolicy) {
        return {
          status: 404,
          body: {
            message: "Invalid credentials",
            errors: ["Invalid credentials"],
          },
        };
      }
      /* 1. Policy validation */
      const validation = validateSignupAgainstProjectPolicy(
        body,
        projectPolicy,
        passwordPolicy,
      );

      if (!validation.valid) {
        return {
          status: 400,
          body: {
            message: "Signup validation failed",
            errors: validation.errors,
          },
        };
      }

      const { fullName, email, password, phone, role, status } = body;

      /* 2. Auth handling */
      let hashedPassword;
      if (projectPolicy.authType === AuthType.PASSWORD) {
        const existingUser = await findUserByEmailInProject(email, project._id);

        if (existingUser) {
          return {
            status: 400,
            body: {
              message: "User already exists",
              errors: ["User already exists"],
            },
          };
        }
        hashedPassword = await PasswordUtils.hash(password);
      } else {
        // this is temporary if i made oath then i will remove this and work for other auth types
        return {
          status: 400,
          body: {
            message: "auth type not supported",
            errors: ["auth type not supported"],
          },
        };
      }

      const user = await User.create({
        fullName,
        email,
        passwordHash: hashedPassword,
        phone,
      });

      const endUser = await EndUser.create({
        userId: user._id,
        projectId: project._id,
        role,
        status,
      });

      const { accessToken, refreshToken } = this.tokenResponse(user);
      await Session.create({
        userId: user._id,
        refreshToken: refreshToken,
      });

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
          },
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: "Internal Server Error",
          errors: ["Internal Server Error"],
        },
      };
    }
  };

  loginService = async (body: any, context: any) => {
    try {
      const { email, password } = body;
      const { project } = context;
      if (!project._id || !email) {
        return {
          status: 404,
          body: {
            message: "Invalid credentials",
            errors: ["Invalid credentials"],
          },
        };
      }
      const existingUser = await findUserByEmailInProject(email, project._id);
      if (!existingUser) {
        return {
          status: 404,
          body: {
            message: "User not found",
            errors: ["User not found"],
          },
        };
      }
      const { user, endUser } = existingUser;

      const isPasswordValid = await PasswordUtils.compare(
        password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        return {
          status: 401,
          body: {
            message: "Invalid password",
            errors: ["Invalid password"],
          },
        };
      }
      const { accessToken, refreshToken } = this.tokenResponse(
        existingUser.user,
      );
      await Session.create({
        userId: user._id,
        refreshToken: refreshToken,
      });
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
          },
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: "Internal Server Error",
          errors: ["Internal Server Error"],
        },
      };
    }
  };

  logOutService =async (user:any,context:any) => {
    try {
      const {_id} = user;  
      const {project} = context;
      if (!_id || !project._id) {
        return {
          status: 404,
          body: {
            message: "Invalid credentials",
            errors: ["Invalid credentials"],
          },
        };
      }
      const session = await Session.findOne({
        userId: _id,
        projectId: project._id,
      });
      if (!session) {
        return {
          status: 404,
          body: {
            message: "Session not found",
            errors: ["Session not found"],
          },
        };
      }
      await session.deleteOne();
      return {
        status: 200,
        body: {
          message: "User logged out successfully",
        },
      };

    } catch (error) {
      console.log(error);
      return {
        status: 500,
        body: {
          message: "Internal Server Error",
          errors: ["Internal Server Error"],
        },
      };
    }
  }

  private tokenResponse(user: IUser) {
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
