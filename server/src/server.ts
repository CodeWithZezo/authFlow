import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './modules/index';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/database';

const app = express();

// ----------------------------
// Security middleware
// ----------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// ----------------------------
// Rate limiting middleware
// ----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ----------------------------
// Body parsing middleware
// ----------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----------------------------
// Health check endpoint
// ----------------------------
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------
// API routes
// ----------------------------
app.use('/api', routes);

// ----------------------------
// 404 handler (catch-all)
// ----------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  });
});

// ----------------------------
// Error handling middleware
// ----------------------------


// ----------------------------
// Start server
// ----------------------------
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();

export default app;
