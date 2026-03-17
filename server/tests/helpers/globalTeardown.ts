// tests/helpers/globalTeardown.ts
// Runs once after the entire integration/e2e suite.
// Stops the in-memory MongoDB instance.

export default async function globalTeardown() {
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
}
