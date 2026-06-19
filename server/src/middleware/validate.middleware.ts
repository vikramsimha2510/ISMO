import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory that returns Express middleware to validate `req.body` against
 * the given Zod schema. If validation fails, responds with 400 and a
 * structured `{ message, errors }` payload.
 *
 * Usage:
 *   router.post('/', validate(createProjectSchema), controller.create);
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        message: 'Validation failed',
        errors: formatted,
      });
      return;
    }

    // Replace req.body with the parsed (and potentially coerced/defaulted) data
    req.body = result.data;
    next();
  };
};

/**
 * Validate query parameters instead of body.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const formatted = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        message: 'Validation failed',
        errors: formatted,
      });
      return;
    }

    // Overwrite req.query with parsed values (numbers are coerced, defaults applied)
    req.query = result.data;
    next();
  };
};
