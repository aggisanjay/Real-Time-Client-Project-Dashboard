import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenUserPayload } from '../services/tokenService.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenUserPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required.',
      },
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Your session has expired or is invalid. Please refresh or log in again.',
      },
    });
    return;
  }

  req.user = payload;
  next();
}
