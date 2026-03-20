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
      unique: true,   // this already creates an index — no need for index:true
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
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
        validator: (v: string) => !v || /^\+?[1-9]\d{1,14}$/.test(v),
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
    },
    isVerified: { type: Boolean, default: false },
    avatarUrl:  { type: String, trim: true, default: null },
    avatarKey: {
      type: String,
      trim: true,
      default: null,
      select: false, // NEVER returned in queries by default
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
      select: false, // never expose private metadata
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound index for isVerified lookups (used in org creation check)
userSchema.index({ isVerified: 1 });

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default userSchema;
