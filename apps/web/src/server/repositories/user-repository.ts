import { prisma } from '@/lib/prisma';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
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
