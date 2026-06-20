import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required');
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
