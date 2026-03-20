import mongoose, { Schema, Model } from "mongoose";
import { IOrganizationMembership } from "../models.types";
import { Role, Status } from "../enums";

const OrganizationMembershipSchema: Schema<IOrganizationMembership> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      // No index:true here — covered by the compound index below
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
      // No index:true here — covered by the compound index below
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
  { timestamps: true, versionKey: false }
);

// Compound unique index — covers findOne({userId, orgId}) which is the hot path
// Also covers find({orgId}) for member listing, and find({userId}) for user's orgs
OrganizationMembershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });
// Secondary index for org-centric queries (list all members of an org)
OrganizationMembershipSchema.index({ orgId: 1 });

export const OrganizationMembership: Model<IOrganizationMembership> = mongoose.model<IOrganizationMembership>(
  "OrganizationMembership",
  OrganizationMembershipSchema
);
export default OrganizationMembershipSchema;
