import mongoose , {Model, Schema} from "mongoose";
import { IProjectPolicy } from "../models.types";
import { AuthType, AuthMethod } from "../enums";

const projectPolicySchema: Schema<IProjectPolicy> = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project is required"],
    },
    phoneRequired: {
        type: Boolean,
        required: [true, "Phone required is required"],
        default: false,
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
    statuses: {
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

projectPolicySchema.index({ projectId: 1 }, { unique: true });

export const ProjectPolicy: Model<IProjectPolicy> = mongoose.model<IProjectPolicy>("ProjectPolicy", projectPolicySchema);

export default projectPolicySchema;