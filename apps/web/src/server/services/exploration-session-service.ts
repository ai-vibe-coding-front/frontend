import { randomBytes } from 'crypto';
import { jwtVerify } from 'jose';
import {
  createExplorationSession,
  hasGuestUsedSession,
} from '@/server/repositories/exploration-session-repository';

export async function verifyAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const rawSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!rawSecret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(rawSecret));
    return true;
  } catch {
    return false;
  }
}

export function generateSessionKey(): string {
  return randomBytes(32).toString('hex');
}

export async function createExplorationSessionForUserOrGuest(
  sessionKey: string,
  location: {
    lat?: number;
    lng?: number;
    nx?: number;
    ny?: number;
    sido?: string;
    address?: string;
    stationName?: string;
  },
  userId?: string | null,
) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30일
  return createExplorationSession({
    sessionKey,
    userId: userId ?? undefined,
    isGuest: userId == null,
    expiresAt,
    ...location,
  });
}

export async function checkGuestUsed(sessionKey: string): Promise<{ hasUsed: boolean }> {
  const hasUsed = await hasGuestUsedSession(sessionKey);
  return { hasUsed };
}
