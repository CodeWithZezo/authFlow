import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import routes from './modules/index';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { AppError } from './utils/errors';

dotenv.config();

// ── Validate required env vars before anything else ───────────────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN'];
if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

import connectDB from './config/database';

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigin = process.env.CORS_ORIGIN;
if (process.env.NODE_ENV === 'production' && !allowedOrigin) {
  throw new Error('CORS_ORIGIN must be set in production');
}

app.use(
  cors({
    origin: allowedOrigin ?? 'http://localhost:5173',
    credentials: true,
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Strict limiter for auth endpoints — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General limiter for all other API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/signup', authLimiter);
app.use('/api/v1/auth/refresh-token', authLimiter);
app.use('/api/', generalLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
// 1mb is plenty for JSON auth payloads — multer handles file uploads separately
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
// Only exposes ok/degraded — no internal details leak
app.get('/health', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  const healthy = dbState === 1;
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'The requested resource was not found' },
  });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Must have 4 params so Express recognises it as an error middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code ?? 'ERROR', message: err.message },
    });
  }

  // In production, never leak internal error details
  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  });
});

// ── Process-level crash guards ────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV ?? 'development'}`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────────────────
    const shutdown = (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        mongoose.connection.close().then(() => {
          logger.info('MongoDB connection closed');
          process.exit(0);
        });
      });

      // Force exit if graceful shutdown takes too long
      setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

export default app;
