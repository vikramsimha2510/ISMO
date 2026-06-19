/**
 * Custom operational error class.
 * Thrown intentionally in service/controller code to signal expected failures
 * (e.g. 404, 409, 401). The centralized error handler formats these for the client.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Preserve the correct prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
