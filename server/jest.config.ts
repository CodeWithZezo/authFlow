import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: [
    "<rootDir>/src/tests/**/*.test.ts",
    "<rootDir>/src/tests/**/*.spec.ts",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  globalSetup: "<rootDir>/src/tests/setup/globalSetup.ts",
  globalTeardown: "<rootDir>/src/tests/setup/globalTeardown.ts",
  setupFilesAfterFramework: [],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/jest.setup.ts"],
  collectCoverageFrom: [
    "src/app/**/*.ts",
    "!src/app/server.ts",
    "!src/app/config/database.ts",
    "!src/app/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 30000,
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};

export default config;
