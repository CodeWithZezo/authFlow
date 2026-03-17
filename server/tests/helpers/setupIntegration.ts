// tests/helpers/setupIntegration.ts
// Runs once per test FILE (setupFilesAfterFramework).
// Connects Mongoose to the in-memory MongoDB, wipes collections between each test.

import mongoose from "mongoose";

beforeAll(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set — globalSetup may not have run");
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Drop all collections between tests so state doesn't leak
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
