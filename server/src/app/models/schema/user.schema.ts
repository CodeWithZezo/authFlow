import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../models.types";

const userSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (v: string) =>
          !v || /^\+?[1-9]\d{1,14}$/.test(v), // E.164 phone format
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null,
    },
    // S3 object key — stored internally, NEVER returned to clients directly.
    // The streaming endpoint /auth/avatar/:userId is the only way to access the image.
    avatarKey: {
      type: String,
      trim: true,
      default: null,
      select: false, // excluded from all queries by default
    },
    publicMetadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    privateMetadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
    versionKey: false, // remove __v field in production
  }
);

// Optional: Create and export the model
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default userSchema;