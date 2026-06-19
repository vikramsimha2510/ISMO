import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints.
 * 10 requests per 15-minute window per IP — defense-in-depth
 * on top of Supabase's own auth rate limits.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  message: {
    message: 'Too many requests — please try again later',
  },
});
