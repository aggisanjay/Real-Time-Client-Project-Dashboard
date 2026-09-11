import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled server error:', err);

  const status = typeof err.status === 'number' ? err.status : 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');
  const message = err.message || 'An unexpected error occurred. Please try again later.';

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}
