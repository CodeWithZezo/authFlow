// tests/helpers/globalSetup.ts
// Runs once before the entire integration/e2e suite.
// Starts an in-memory MongoDB instance using @shelf/jest-mongodb or mongodb-memory-server.

import { MongoMemoryServer } from "mongodb-memory-server";

declare global {
  // eslint-disable-next-line no-var
  var __MONGOD__: MongoMemoryServer;
}

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      dbName: "authcore_test",
    },
  });

  // Store the URI so setupIntegration.ts can connect Mongoose to it
  process.env.MONGODB_URI = mongod.getUri();

  // Ensure JWT secrets are set for all tests
  process.env.JWT_ACCESS_SECRET  = "test-access-secret-minimum-32-characters-long";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-minimum-32-characters-long";
  process.env.JWT_ACCESS_EXPIRES_IN  = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.NODE_ENV = "test";

  // Store the server instance globally so globalTeardown can stop it
  global.__MONGOD__ = mongod;
}
