import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Centralized error-handling middleware.
 *
 * - AppError (operational): sends the error's statusCode + message.
 * - Unknown errors: sends a generic 500 and logs the full stack.
 * - Stack traces and Supabase internals are NEVER sent to the client.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Log the full error internally
  logger.error(err.message, {
    stack: err.stack,
    ...(err instanceof AppError && { statusCode: err.statusCode }),
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Unexpected / programming error — never leak details
  res.status(500).json({
    message: env.NODE_ENV === 'development'
      ? `Internal Server Error: ${err.message}`
      : 'Internal Server Error',
  });
};
