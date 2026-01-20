import mongoose, { Schema, Model } from "mongoose";
import { IOrganization } from "../models.types";

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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Organization: Model<IOrganization> = mongoose.model<IOrganization>("Organization", orgSchema);

export default orgSchema;
