import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { IOrganization, IPasswordPolicy } from "../models.types";



const passwordPolicySchema = new Schema<IPasswordPolicy>(
  {
    minLength: { type: Number, required: true, default: 8, min: 4 },
    requireNumbers: { type: Boolean, required: true, default: true },
    requireUppercase: { type: Boolean, required: true, default: true },
    requireSpecialChars: { type: Boolean, required: true, default: false },
  },
  { _id: false } // Don't create a separate _id for subdocument
);

const orgSchema: Schema<IOrganization> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Organization slug is required"],
      trim: true,
      maxlength: [100, "Organization slug cannot exceed 100 characters"],
      lowercase: true,
      unique: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"],
    },
    passwordPolicy: {
      type: passwordPolicySchema,
      required: false,
      default: () => ({
        minLength: 8,
        requireNumbers: true,
        requireUppercase: true,
        requireSpecialChars: false,
      }),
    },
    phoneRequired: {
      type: Boolean,
      required: [true, "phone is required"],
      default: false,
    },
    roleRequired: {
      type: Boolean,
      required: [true, "role is required"],
      default: false,
    },
    roles: {
      type: [String],
      required: [true, "roles are required"],
      default: ["user"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Organization: Model<IOrganization> = mongoose.model<IOrganization>("Organization", orgSchema);

export default orgSchema;
