import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { createRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

async function main() {
  // Database connection
  const dbHost = process.env.DB_HOST || 'localhost';
  const isRemote = dbHost !== 'localhost';
  const pool = new Pool({
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'iptv_premium',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: isRemote ? 15000 : 2000,
    ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  // Test database connection
  try {
    const client = await pool.connect();
    logger.info('Database connected successfully');
    client.release();
  } catch (error) {
    logger.error('Database connection failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    logger.warn('Server will start without database. Some features may not work.');
  }

  // Initialize Express app
  const app = express();

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  }));
  const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map(s => s.trim());
  app.use(cors({
    origin: NODE_ENV === 'development' ? true : corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }));
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // API Routes
  app.use('/api', createRoutes(pool));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // Global error handler
  app.use(errorHandler);

  // Start server
  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      environment: NODE_ENV,
      url: `http://localhost:${PORT}`,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await pool.end();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection', { error: reason.message, stack: reason.stack });
  });
}

main().catch((error) => {
  logger.error('Failed to start server', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
