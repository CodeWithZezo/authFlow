import mongoose from "mongoose";
import { IProject } from "../models.types";
import { Status } from "../enums";

const projectSchema = new mongoose.Schema<IProject>({
    name: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
        maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: [true, "Organization is required"],
    },
    status: {
        type: String,
        enum: Status,
        default: Status.ACTIVE,
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    }    
}, {
    timestamps: true,
    versionKey: false,
})

projectSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default mongoose.model<IProject>("Project", projectSchema);