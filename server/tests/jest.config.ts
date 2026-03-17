import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",

  // Map source imports the same way tsconfig paths would
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Separate projects for unit, integration, and e2e
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      // Unit tests never touch DB — no setup needed
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      globalSetup: "<rootDir>/tests/helpers/globalSetup.ts",
      globalTeardown: "<rootDir>/tests/helpers/globalTeardown.ts",
      setupFilesAfterFramework: ["<rootDir>/tests/helpers/setupIntegration.ts"],
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/tests/e2e/**/*.test.ts"],
      preset: "ts-jest",
      testEnvironment: "node",
      globalSetup: "<rootDir>/tests/helpers/globalSetup.ts",
      globalTeardown: "<rootDir>/tests/helpers/globalTeardown.ts",
      setupFilesAfterFramework: ["<rootDir>/tests/helpers/setupIntegration.ts"],
      // e2e tests are slower — give them more time
      testTimeout: 30000,
    },
  ],

  // Coverage from src only
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",          // entry point, not logic
    "!src/models/schema/**",  // schemas are declaration-only
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",
};

export default config;
