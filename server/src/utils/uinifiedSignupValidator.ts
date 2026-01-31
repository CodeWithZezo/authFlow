import { IProjectPolicy } from "../models/models.types";
import { validatePassword } from "./password.utils.EndUser";
import { AuthMethod, AuthType, Role, Status } from "../models/enums";
import { User } from "../models/schema/user.schema";
import { EndUser } from "../models/schema/endUser.schema";

interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  authMethod: AuthMethod;
  role?: Role;
  status?: Status;
}

interface PolicyCheckResult {
  valid: boolean;
  errors: string[];
}

export const validateSignupAgainstProjectPolicy = (
  payload: SignupInput,
  projectPolicy: IProjectPolicy,
  passwordPolicy?: any
): PolicyCheckResult => {
  try {
    const errors: string[] = [];
    
  /* ---------- Auth Required ---------- */
  if (projectPolicy.authRequired && !payload.authMethod) {
    errors.push("Authentication method is required");
  }

  /* ---------- Allowed Auth Methods ---------- */
  if (
    projectPolicy.authMethods?.length &&
    !projectPolicy.authMethods.includes(payload.authMethod)
  ) {
    errors.push(`Auth method '${payload.authMethod}' is not allowed`);
  }

  /* ---------- Auth Type Enforcement ---------- */
  if (projectPolicy.authType === AuthType.PASSWORD) {
    if (!payload.password) {
      errors.push("Password is required for password authentication");
    }
  } else {
    if (payload.password) {
      errors.push("Password should not be provided for this authentication type");
    }
  }

  /* ---------- Phone Requirement ---------- */
  if (projectPolicy.phoneRequired) {
    if (
      payload.authMethod === AuthMethod.PHONE &&
      !payload.phone
    ) {
      errors.push("Phone number is required for phone authentication");
    }
  }

  /* ---------- Role Enforcement ---------- */
  if (
    payload.role &&
    !projectPolicy.roles.includes(payload.role)
  ) {
    errors.push(`Role '${payload.role}' is not allowed for this project`);
  }

  /* ---------- Status Enforcement ---------- */
  if (
    payload.status &&
    !projectPolicy.statuses.includes(payload.status)
  ) {
    errors.push(`Status '${payload.status}' is not allowed for this project`);
  }

  /* ---------- Password Policy ---------- */
  if (
    projectPolicy.authType === AuthType.PASSWORD &&
    payload.password
  ) {
    if (!passwordPolicy) {
      errors.push("Password policy not configured");
    } else {
      const pwdResult = validatePassword(payload.password, passwordPolicy);
      if (!pwdResult.valid) {
        errors.push(...pwdResult.errors);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
  } catch (error) {
    console.log(error);
    return {
      valid: false,
      errors: ["Internal Server Error"],
    };
  }
};

export const findUserByEmailInProject = async (
  email: string,
  projectId: string
) => {

 try {
   /* 1. Find user by email */
  const user = await User.findOne({ email:email }).select('+passwordHash').lean();

  if (!user) {
    return null; // user does not exist at all
    
  }

  /* 2. Check project membership */
  const endUser = await EndUser.findOne({
    userId: user._id,
    projectId: projectId,
    status: { $ne: Status.SUSPENDED }
  }).lean();

  if (!endUser) {
    return null; // user exists but not in this project
  }


  return {
    user,
    endUser
  };
 } catch (error) {
  console.log(error);
  return null;
 }
};
