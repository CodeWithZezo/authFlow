import { IProjectPolicy } from "../models/models.types";
import { validatePassword } from "./password.utils.EndUser";
import { AuthMethod, AuthType, Status } from "../models/enums";
import { User } from "../models/schema/user.schema";
import { EndUser } from "../models/schema/endUser.schema";

interface SignupInput {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  authMethod: AuthMethod;
  role?: string;
  status?: string;
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
  const errors: string[] = [];

  if (projectPolicy.authRequired && !payload.authMethod) {
    errors.push("Authentication method is required");
  }

  if (projectPolicy.authMethods?.length && !projectPolicy.authMethods.includes(payload.authMethod)) {
    errors.push(`Auth method '${payload.authMethod}' is not allowed`);
  }

  if (projectPolicy.authType === AuthType.PASSWORD) {
    if (!payload.password) errors.push("Password is required for password authentication");
  } else if (payload.password) {
    errors.push("Password should not be provided for this authentication type");
  }

  if (projectPolicy.phoneRequired && payload.authMethod === AuthMethod.PHONE && !payload.phone) {
    errors.push("Phone number is required for phone authentication");
  }

  if (payload.role && projectPolicy.roles?.length && !projectPolicy.roles.includes(payload.role as any)) {
    errors.push(`Role '${payload.role}' is not allowed for this project`);
  }

  if (payload.status && projectPolicy.statuses?.length && !projectPolicy.statuses.includes(payload.status as any)) {
    errors.push(`Status '${payload.status}' is not allowed for this project`);
  }

  if (projectPolicy.authType === AuthType.PASSWORD && payload.password) {
    if (!passwordPolicy) {
      errors.push("Password policy not configured");
    } else {
      const pwdResult = validatePassword(payload.password, passwordPolicy);
      if (!pwdResult.valid) errors.push(...pwdResult.errors);
    }
  }

  return { valid: errors.length === 0, errors };
};

// FIX: parallel query — fetch user and endUser at the same time.
// We can look up the user by email first, then check endUser in parallel once we have the userId.
// But since endUser requires userId we still need the user first.
// Optimisation: use a lean projection on User (only the fields we need).
export const findUserByEmailInProject = async (
  email: string,
  projectId: string
) => {
  if (!email || !projectId) return null;

  try {
    const user = await User.findOne(
      { email: email.toLowerCase() },
      { _id: 1, fullName: 1, email: 1, phone: 1, passwordHash: 1 }
    )
      .select("+passwordHash")
      .lean();

    if (!user) return null;

    const endUser = await EndUser.findOne(
      { userId: user._id, projectId, status: { $ne: Status.SUSPENDED } },
      { _id: 1, role: 1, status: 1 }
    ).lean();

    if (!endUser) return null;

    return { user, endUser };
  } catch (err) {
    console.error(err);
    return null;
  }
};
