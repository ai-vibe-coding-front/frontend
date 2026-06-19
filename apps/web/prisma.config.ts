import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl =
  process.env['DIRECT' + '_URL'] ??
  process.env['DATABASE' + '_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL or DIRECT_URL is required');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
});