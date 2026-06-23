import { prisma } from '@/lib/prisma';

export async function createExplorationSession(data: {
  sessionKey: string;
  isGuest: boolean;
  userId?: string;
  lat?: number;
  lng?: number;
  nx?: number;
  ny?: number;
  sido?: string;
  address?: string;
  stationName?: string;
  expiresAt?: Date;
}) {
  return prisma.explorationSession.create({
    data,
    select: { id: true, status: true, expiresAt: true },
  });
}

export async function hasGuestUsedSession(sessionKey: string): Promise<boolean> {
  const session = await prisma.explorationSession.findFirst({
    where: { sessionKey, isGuest: true },
    select: { id: true },
  });
  return session !== null;
}
