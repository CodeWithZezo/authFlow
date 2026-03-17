// tests/helpers/app.ts
// Builds the Express application without calling app.listen().
// Imported by integration and e2e tests and passed directly to supertest(app).

import express from "express";
import cookieParser from "cookie-parser";
import router from "../../src/modules/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", router);

export default app;
