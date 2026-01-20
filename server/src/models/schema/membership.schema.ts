import mongoose, { Schema, Model } from "mongoose";
import { IMembership } from "../models.types";
import { Role, Status } from "../enums";

const membershipSchema: Schema<IMembership> = new Schema(
    {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // speeds up queries by user
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
      index: true, // speeds up queries by org
    },
    role: {
      type: String,
      enum: Role,
      required: [true, "Role is required"],
      default: Role.MEMBER,
    },
    status: {
      type: String,
      enum: Status,
      required: [true, "Status is required"],
      default: Status.ACTIVE,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false, // remove __v
  }
);
membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const Membership: Model<IMembership> = mongoose.model<IMembership>("Membership", membershipSchema);

export default membershipSchema;
