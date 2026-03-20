import mongoose, { Schema, Model } from "mongoose";
import { Role, Status } from "../enums";
import { IProjectMembership } from "../models.types";

const projectMembershipSchema = new Schema<IProjectMembership>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      // No index:true — covered by compound index below
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      // No index:true — covered by compound index below
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound unique index — hot path: findOne({projectId, userId})
projectMembershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });
// Secondary for project-centric list queries
projectMembershipSchema.index({ projectId: 1 });

export const ProjectMembership: Model<IProjectMembership> = mongoose.model<IProjectMembership>(
  "ProjectMembership",
  projectMembershipSchema
);
