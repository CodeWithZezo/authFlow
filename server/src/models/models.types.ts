// ==================== src/types/models.types.ts ====================
import { Document, Types } from 'mongoose';
import { Role, Status } from './enums';

export interface IUser extends Document {
  fullName: string;
  email: string; 
  passwordHash: string;
  phone?: string | null;
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
  passwordPolicy: IPasswordPolicy;
  phoneRequired: boolean;
  roleRequired: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireSpecialChars: boolean;
}

export interface IMembership extends Document {
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
    active: boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}