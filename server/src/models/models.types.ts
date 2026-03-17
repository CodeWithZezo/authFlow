// ==================== src/types/models.types.ts ====================
import { Document, Types } from 'mongoose';
import { Role, Status, AuthType, AuthMethod } from './enums';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  publicMetadata: Map<string, any>;
  privateMetadata: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  isVerified: boolean;
}

export interface IOrganization extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IOrganizationMembership extends Document {
  userId: Types.ObjectId;
  orgId: Types.ObjectId;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  name: string;
  organizationId: Types.ObjectId;
  status: Status;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectMembership extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndUser extends Document {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordPolicy extends Document {
  projectId: Types.ObjectId;
  minLength: number;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireSpecialChars: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectPolicy extends Document {
  projectId: Types.ObjectId;
  phoneRequired: boolean;
  authRequired: boolean;
  authType: AuthType;
  roles: string[];
  statuses: string[];
  authMethods: AuthMethod[];
  passwordPolicyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}