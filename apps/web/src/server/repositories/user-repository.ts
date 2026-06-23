import { prisma } from '@/lib/prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserWithCredentialByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nickname: true,
      credential: { select: { passwordHash: true } },
    },
  });
}

export async function findUserWithFavoriteCount(id: string) {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  });
}

export async function saveRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  return prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function revokeRefreshToken(tokenHash: string) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function createUserWithCredential(
  email: string,
  nickname: string,
  passwordHash: string,
) {
  return prisma.user.create({
    data: {
      email,
      nickname,
      credential: {
        create: { passwordHash },
      },
    },
    select: { id: true, email: true, nickname: true },
  });
}
