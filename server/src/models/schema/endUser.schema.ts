import mongoose,{Schema, Model} from 'mongoose'
import {IEndUser} from '../models.types'
import { Role, Status } from '../enums'


const endUserSchema = new Schema<IEndUser>({
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
        enum: Role,
        required: [true, "Role is required"],
    },
    status: {
        type: String,
        enum: Status,
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

endUserSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const EndUser: Model<IEndUser> = mongoose.model<IEndUser>("EndUser", endUserSchema);
