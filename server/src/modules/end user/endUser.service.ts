import { AuthType } from "../../models/enums";
import { EndUser } from "../../models/schema/endUser.schema";
import { User } from "../../models/schema/user.schema";
import { PasswordUtils } from "../../utils/password.utils";
import {
  findUserByEmailInProject,
  validateSignupAgainstProjectPolicy,
} from "../../utils/uinifiedSignupValidator";

export class EndUserService {
  constructor() { }

  signupService = async (body: any, context: any) => {
    try {
      const { project, passwordPolicy, projectPolicy } = context;

      /* 1. Policy validation */
      const validation = validateSignupAgainstProjectPolicy(
        body,
        projectPolicy,
        passwordPolicy,
      );

      if (!validation.valid) {
        throw {
          status: 400,
          message: "Signup validation failed",
          errors: validation.errors,
        };
      }

      const { fullName,email, password, phone, role, status } = body;

      /* 2. Auth handling */
      let hashedPassword;
      if (projectPolicy.authType === AuthType.PASSWORD) {
        const existingUser = await findUserByEmailInProject(
          email,
          project._id,
        );
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

      return {
        status: 201,
        body: {
          message: "User created successfully",
          user: {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: endUser.role,
            status: endUser.status,
          },
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
  };
}
