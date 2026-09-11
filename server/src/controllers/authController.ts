import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import {
  generateAccessToken,
  createRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  hashToken,
} from '../services/tokenService.js';
import { Role } from '@prisma/client';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await createRefreshToken(user.id);
    setRefreshTokenCookie(res, refreshToken);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;

    if (!rawRefreshToken) {
      res.status(401).json({
        error: {
          code: 'NO_REFRESH_TOKEN',
          message: 'Refresh token is missing from cookie.',
        },
      });
      return;
    }

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      clearRefreshTokenCookie(res);
      res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token is expired or revoked. Please log in again.',
        },
      });
      return;
    }

    // Token rotation: revoke current token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new refresh token
    const newRefreshToken = await createRefreshToken(storedToken.userId);
    setRefreshTokenCookie(res, newRefreshToken);

    // Issue new access token
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
      role: storedToken.user.role,
    });

    res.json({
      accessToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.refreshToken;
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
    }

    clearRefreshTokenCookie(res);
    res.json({ message: 'Successfully logged out.' });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
