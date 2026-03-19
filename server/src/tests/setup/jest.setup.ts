import mongoose from "mongoose";

// ─── Connect once per file ────────────────────────────────────────────────────
beforeAll(async () => {
  const uri = process.env.MONGODB_URI!;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

// ─── Clear every collection between tests ─────────────────────────────────────
// This gives each test a clean slate without restarting the server.
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Disconnect after all tests in this file ──────────────────────────────────
afterAll(async () => {
  await mongoose.disconnect();
});
