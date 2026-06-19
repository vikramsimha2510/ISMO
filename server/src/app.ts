import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { morganStream } from './config/logger.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { notFoundHandler } from './middleware/notFoundHandler.middleware.js';

// Route modules
import authRoutes from './modules/auth/auth.routes.js';
import projectRoutes from './modules/projects/projects.routes.js';
import taskRoutes from './modules/tasks/tasks.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';

const app = express();

// ──────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — locked to the frontend origin
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// HTTP request logging (piped to winston)
app.use(morgan('short', { stream: morganStream }));

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check (no auth required)
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────────
// Error Handling (must be after routes)
// ──────────────────────────────────────────

// Unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
