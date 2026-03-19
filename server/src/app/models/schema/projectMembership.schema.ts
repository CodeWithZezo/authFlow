import mongoose from "mongoose";
import { Schema, Model } from "mongoose";
import { Role, Status } from "../enums";
import {IProjectMembership} from "../models.types"

const projectMembershipSchema = new Schema<IProjectMembership>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required"],
        index: true, // speeds up queries by project
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true, // speeds up queries by user
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})

projectMembershipSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectMembership: Model<IProjectMembership> = mongoose.model<IProjectMembership>("ProjectMembership", projectMembershipSchema);
