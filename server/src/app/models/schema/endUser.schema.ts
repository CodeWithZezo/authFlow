import mongoose, { Schema, Model } from "mongoose";
import { IEndUser } from "../models.types";

const endUserSchema = new Schema<IEndUser>(
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
    role:   { type: String, default: "" },
    status: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

// Compound unique — hot path: findOne({userId, projectId}) for login / profile
endUserSchema.index({ projectId: 1, userId: 1 }, { unique: true });
// Secondary for project-centric user listing
endUserSchema.index({ projectId: 1 });

export const EndUser: Model<IEndUser> = mongoose.model<IEndUser>("EndUser", endUserSchema);
