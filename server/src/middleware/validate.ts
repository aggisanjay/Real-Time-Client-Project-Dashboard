import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: message || 'Validation failed on request body.',
            details: error.errors,
          },
        });
        return;
      }
      next(error);
    }
  };
}
