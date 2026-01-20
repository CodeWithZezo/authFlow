import mongoose, { Schema, Model } from "mongoose";
import { IOrganizationMembership } from "../models.types";
import { Role, Status } from "../enums";

const OrganizationMembershipSchema: Schema<IOrganizationMembership> = new Schema(
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
OrganizationMembershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const OrganizationMembership: Model<IOrganizationMembership> = mongoose.model<IOrganizationMembership>("OrganizationMembership", OrganizationMembershipSchema);

export default OrganizationMembershipSchema;
