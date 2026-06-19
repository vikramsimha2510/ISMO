import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabaseAdmin.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Auth middleware — verifies the Supabase access token from the Authorization header.
 *
 * On success: attaches `req.user = { id, email }` for downstream handlers.
 * On failure: responds with 401 Unauthorized.
 */
export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized — missing or malformed token', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Unauthorized — missing token', 401);
    }

    // Let Supabase verify the token (signature, expiry, revocation).
    // This works regardless of the JWT secret — we never touch it ourselves.
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      throw new AppError('Unauthorized — invalid or expired token', 401);
    }

    // Attach user info for downstream route handlers
    req.user = {
      id: data.user.id,
      email: data.user.email!,
    };

    next();
  },
);
