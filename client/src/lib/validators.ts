// ==================== src/lib/validators.ts ====================
import { z } from "zod";
import { Role, Status, AuthType, AuthMethod } from "@/types";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-()]{7,15}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// ─── Organization ─────────────────────────────────────────────────────────────
const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(50, "Slug must be less than 50 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only");

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  slug: slugSchema,
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: slugSchema.optional(),
});

export const addOrgMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

export const updateOrgMemberSchema = z.object({
  role:   z.nativeEnum(Role).optional(),
  status: z.nativeEnum(Status).optional(),
});

// ─── Project ──────────────────────────────────────────────────────────────────
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const updateProjectSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status:      z.nativeEnum(Status).optional(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.nativeEnum(Role, { message: "Invalid role" }),
});

export const updateProjectMemberSchema = z.object({
  role:   z.nativeEnum(Role).optional(),
  status: z.nativeEnum(Status).optional(),
});

// ─── Password Policy ──────────────────────────────────────────────────────────
export const createPasswordPolicySchema = z.object({
  minLength: z
    .number()
    .min(4, "Minimum length cannot be less than 4")
    .max(128, "Minimum length cannot exceed 128")
    .optional()
    .default(6),
  requireNumbers:      z.boolean().optional().default(true),
  requireUppercase:    z.boolean().optional().default(true),
  requireSpecialChars: z.boolean().optional().default(false),
});

export const updatePasswordPolicySchema = z.object({
  minLength: z
    .number()
    .min(4, "Minimum length cannot be less than 4")
    .max(128)
    .optional(),
  requireNumbers:      z.boolean().optional(),
  requireUppercase:    z.boolean().optional(),
  requireSpecialChars: z.boolean().optional(),
});

// ─── Project Policy ───────────────────────────────────────────────────────────
export const createProjectPolicySchema = z.object({
  authRequired:   z.boolean().optional().default(true),
  phoneRequired:  z.boolean().optional().default(false),
  authType:       z.nativeEnum(AuthType).optional().default(AuthType.PASSWORD),
  authMethods:    z.array(z.nativeEnum(AuthMethod)).optional().default([]),
  roles:          z.array(z.string()).optional().default([]),
  statuses:       z.array(z.string()).optional().default([]),
});

export const updateProjectPolicySchema = createProjectPolicySchema.partial();

// ─── Inferred types ───────────────────────────────────────────────────────────
export type SignupFormValues          = z.infer<typeof signupSchema>;
export type LoginFormValues           = z.infer<typeof loginSchema>;
export type ChangePasswordFormValues  = z.infer<typeof changePasswordSchema>;
export type CreateOrgFormValues       = z.infer<typeof createOrgSchema>;
export type UpdateOrgFormValues       = z.infer<typeof updateOrgSchema>;
export type AddOrgMemberFormValues    = z.infer<typeof addOrgMemberSchema>;
export type CreateProjectFormValues   = z.infer<typeof createProjectSchema>;
export type UpdateProjectFormValues   = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberFormValues = z.infer<typeof addProjectMemberSchema>;
export type CreatePasswordPolicyFormValues = z.infer<typeof createPasswordPolicySchema>;
export type UpdatePasswordPolicyFormValues = z.infer<typeof updatePasswordPolicySchema>;
export type CreateProjectPolicyFormValues  = z.infer<typeof createProjectPolicySchema>;
export type UpdateProjectPolicyFormValues  = z.infer<typeof updateProjectPolicySchema>;

// ─── Profile ──────────────────────────────────────────────────────────────────
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-().]{7,20}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
}).refine((d) => d.fullName || d.phone, { message: "At least one field is required" });

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
