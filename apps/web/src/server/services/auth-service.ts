import { promisify } from 'util';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import {
  createUserWithCredential,
  findUserByEmail,
  findUserById,
  findUserWithCredentialByEmail,
  findRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
} from '@/server/repositories/user-repository';

const scryptAsync = promisify<string, string, number, Buffer>(scrypt);

export const REFRESH_ERRORS = {
  INVALID: 'REFRESH_TOKEN_INVALID',
  REVOKED: 'REFRESH_TOKEN_REVOKED',
  EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
} as const;

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
  const rawSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!rawSecret) throw new Error('ACCESS_TOKEN_SECRET is not set');
  const secret = new TextEncoder().encode(rawSecret);
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
}

/**
 * 인증이 선택적인 API에서 사용한다.
 * 토큰이 없거나 만료/위조된 경우 예외를 던지지 않고 null을 반환한다.
 */
export async function verifyAccessToken(token: string): Promise<string | null> {
  const rawSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!rawSecret) return null;
  const secret = new TextEncoder().encode(rawSecret);
  try {
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function issueRefreshToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(40).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14일
  await saveRefreshToken(userId, tokenHash, expiresAt);
  return { token, expiresAt };
}

export async function refreshTokens(cookieToken: string) {
  const tokenHash = createHash('sha256').update(cookieToken).digest('hex');
  const record = await findRefreshToken(tokenHash);

  if (!record) throw new Error(REFRESH_ERRORS.INVALID);
  if (record.revokedAt) throw new Error(REFRESH_ERRORS.REVOKED);
  if (record.expiresAt < new Date()) throw new Error(REFRESH_ERRORS.EXPIRED);

  const user = await findUserById(record.userId);
  if (!user) throw new Error(REFRESH_ERRORS.USER_NOT_FOUND);

  const revoked = await revokeRefreshToken(tokenHash);
  if (revoked.count === 0) throw new Error(REFRESH_ERRORS.REVOKED);

  const accessToken = await issueAccessToken(user.id);
  const refreshToken = await issueRefreshToken(user.id);

  return { user, accessToken, refreshToken };
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
  if (!user) throw new Error('INVALID_CREDENTIALS');

  const isValid = user.credential
    ? await verifyPassword(password, user.credential.passwordHash)
    : false;
  if (!isValid) throw new Error('INVALID_CREDENTIALS');

  const accessToken = await issueAccessToken(user.id);
  const refreshToken = await issueRefreshToken(user.id);

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname },
    accessToken,
    refreshToken,
  };
}
