import { MongoMemoryServer } from "mongodb-memory-server";

export default async function globalTeardown() {
  const mongod: MongoMemoryServer = (global as any).__MONGOD__;
  if (mongod) {
    await mongod.stop();
    console.log("\n🔴  MongoDB Memory Server stopped");
  }
}
