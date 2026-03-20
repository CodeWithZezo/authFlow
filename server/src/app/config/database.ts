import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      // Connection pool — allows concurrent queries without queuing
      maxPoolSize: 20,
      minPoolSize: 5,

      // Fail fast if MongoDB is unreachable
      serverSelectionTimeoutMS: 5000,

      // Drop slow socket connections quickly
      socketTimeoutMS: 30000,

      // Keep-alive prevents idle connection drops behind load balancers
      heartbeatFrequencyMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
