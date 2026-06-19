import type { Request, Response } from 'express';

/**
 * Catch-all for routes that don't match any defined endpoint.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ message: 'Route not found' });
};
