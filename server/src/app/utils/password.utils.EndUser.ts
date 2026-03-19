import { IPasswordPolicy } from "../models/models.types";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string,
  policy: IPasswordPolicy
): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { valid: false, errors: ["Password is required"] };
  }

  const { minLength, requireNumbers, requireUppercase, requireSpecialChars } = policy;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
};