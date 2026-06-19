/**
 * Augment the Express Request type so `req.user` is available
 * after the auth middleware attaches it.
 */
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
    };
  }
}
