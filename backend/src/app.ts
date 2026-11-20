import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ENV } from './config/env.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Rate Limiting (Relaxed for tests, protects against spam)
  if (ENV.NODE_ENV !== 'test') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  // Request Logging
  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // JSON Body Parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Root welcome / info
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'DOOMSDAY READY API',
      tagline: 'YOUR MCU JOURNEY STARTS HERE.',
      endpoints: {
        movies: '/api/movies',
        cinemas: '/api/cinemas',
        health: '/api/health',
      },
    });
  });

  // Mount API routes under /api
  app.use('/api', routes);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
