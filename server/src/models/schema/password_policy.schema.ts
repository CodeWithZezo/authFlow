import mongoose, {Model, Schema} from 'mongoose'
import { IPasswordPolicy } from '../models.types'

const passwordPolicySchema = new Schema<IPasswordPolicy>({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project ID is required"],
        index: true,
    },
    minLength: {
        type: Number,
        required: [true, "Minimum length is required"],
        default: 6,
    },
    requireNumbers: {
        type: Boolean,
        required: [true, "Require numbers is required"],
        default: true,
    },
    requireUppercase: {
        type: Boolean,
        required: [true, "Require uppercase is required"],
        default: true,
    },
    requireSpecialChars: {
        type: Boolean,
        required: [true, "Require special characters is required"],
        default: false,
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

passwordPolicySchema.index({ projectId: 1 }, { unique: true });

export const PasswordPolicy: Model<IPasswordPolicy> = mongoose.model<IPasswordPolicy>("PasswordPolicy", passwordPolicySchema);