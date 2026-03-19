import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

export default async function globalSetup() {
  // Load test env vars
  process.env.NODE_ENV = "test";
  process.env.JWT_ACCESS_SECRET = "test_access_secret_authflow_jest";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret_authflow_jest";
  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_ACCESS_KEY_ID = "test_access_key";
  process.env.AWS_SECRET_ACCESS_KEY = "test_secret_key";
  process.env.AWS_S3_BUCKET = "test-authflow-bucket";
  process.env.CORS_ORIGIN = "http://localhost:3000";

  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGODB_URI = uri;

  // Store instance reference so teardown can stop it
  (global as any).__MONGOD__ = mongod;

  console.log("\n🟢  MongoDB Memory Server started:", uri);
}
