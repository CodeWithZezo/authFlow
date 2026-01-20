import mongoose from "mongoose";
import { IProjectPolicy } from "../models.types";
import { AuthType, AuthMethod } from "../enums";

const projectPolicySchema = new mongoose.Schema<IProjectPolicy>({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project is required"],
    },
    authRequired: {
        type: Boolean,
        required: [true, "Auth required is required"],
        default: true,
    },
    authType: {
        type: String,
        enum: AuthType,
        default: AuthType.PASSWORD,
    },
    roles: {
        type: [String],
        default: [],
    },
    authMethods: {
        type: [String],
        enum: AuthMethod,
        default: [],
    },
    passwordPolicyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PasswordPolicy",
        required: [true, "Password policy is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const ProjectPolicy = mongoose.model<IProjectPolicy>("ProjectPolicy", projectPolicySchema);

export default ProjectPolicy;