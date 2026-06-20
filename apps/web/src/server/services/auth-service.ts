import { promisify } from 'util';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { SignJWT } from 'jose';
import {
  createUserWithCredential,
  findUserByEmail,
  findUserWithCredentialByEmail,
  saveRefreshToken,
} from '@/server/repositories/user-repository';

const scryptAsync = promisify<string, string, number, Buffer>(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  const [salt, storedHash] = stored.split(':');
  if (!salt || !storedHash) return false;
  const inputHash = await scryptAsync(input, salt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  return inputHash.length === storedBuf.length && timingSafeEqual(inputHash, storedBuf);
}

export async function issueAccessToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET!);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

export async function issueRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(40).toString('hex');
  const tokenHash = await hashPassword(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14일
  await saveRefreshToken(userId, tokenHash, expiresAt);
  return { token, expiresAt };
}

export async function signup(email: string, password: string, nickname: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }
  const passwordHash = await hashPassword(password);
  return createUserWithCredential(email, nickname, passwordHash);
}

export async function login(email: string, password: string) {
  const user = await findUserWithCredentialByEmail(email);
  if (!user) throw new Error('USER_NOT_FOUND');

  const isValid = user.credential
    ? await verifyPassword(password, user.credential.passwordHash)
    : false;
  if (!isValid) throw new Error('INVALID_PASSWORD');

  const accessToken = await issueAccessToken(user.id);
  const refreshToken = await issueRefreshToken(user.id);

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname },
    accessToken,
    refreshToken,
  };
}
