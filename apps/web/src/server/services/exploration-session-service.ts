import { randomBytes } from 'crypto';
import {
  createExplorationSession,
  hasGuestUsedSession,
} from '@/server/repositories/exploration-session-repository';

export function generateSessionKey(): string {
  return randomBytes(32).toString('hex');
}

export async function createGuestSession(
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
) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30일
  return createExplorationSession({
    sessionKey,
    isGuest: true,
    expiresAt,
    ...location,
  });
}

export async function checkGuestUsed(sessionKey: string): Promise<{ hasUsed: boolean }> {
  const hasUsed = await hasGuestUsedSession(sessionKey);
  return { hasUsed };
}
