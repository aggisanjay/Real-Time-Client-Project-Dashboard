import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Response } from 'express';
import { prisma } from '../config/db.js';
import { ENV } from '../config/env.js';
import { Role } from '@prisma/client';

export interface TokenUserPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function generateAccessToken(payload: TokenUserPayload): string {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: string): Promise<string> {
  const rawToken = generateRefreshTokenString();
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ENV.JWT_REFRESH_EXPIRES_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      revoked: false,
    },
  });

  return rawToken;
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  const maxAge = ENV.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge,
    path: '/api/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth',
  });
}

export function verifyAccessToken(token: string): TokenUserPayload | null {
  try {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenUserPayload;
  } catch {
    return null;
  }
}
