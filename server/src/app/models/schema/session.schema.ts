import mongoose, { Schema, Model } from "mongoose";
import { ISession } from "../models.types";

const sessionSchema: Schema<ISession> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    refreshToken: {
      type: String,
      required: [true, "Refresh token is required"],
    },
  },
  { timestamps: true, versionKey: false }
);

// Compound index covers: findOne({userId, refreshToken}) — the main rotation query
// Also covers: find({userId}) for session listing and deleteMany({userId}) for logout all
// Single field indexes on userId and refreshToken alone are redundant given this compound index
sessionSchema.index({ userId: 1, refreshToken: 1 }, { unique: true });

// TTL index — auto-expire sessions after 7 days (matches refresh token expiry)
// This keeps the sessions collection lean without any cron job
sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export const Session: Model<ISession> = mongoose.model<ISession>("Session", sessionSchema);
export default sessionSchema;
