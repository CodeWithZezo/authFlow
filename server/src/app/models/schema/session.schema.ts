import mongoose, { Schema, Model } from "mongoose";
import { ISession } from "../models.types";

const sessionSchema: Schema<ISession> = new Schema(
    {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // speeds up queries by user
    },
    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
      index: true, // speeds up queries by refresh token
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    versionKey: false, // remove __v
  }
);

sessionSchema.index({ userId: 1, refreshToken: 1 }, { unique: true });

export const Session: Model<ISession> = mongoose.model<ISession>("Session", sessionSchema);

export default sessionSchema;