import { promisify } from 'util';
import { randomBytes, scrypt } from 'crypto';
import { createUserWithCredential, findUserByEmail } from '@/server/repositories/user-repository';

const scryptAsync = promisify<string, string, number, Buffer>(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = await scryptAsync(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

export async function signup(email: string, password: string, nickname: string) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }
  const passwordHash = await hashPassword(password);
  return createUserWithCredential(email, nickname, passwordHash);
}
