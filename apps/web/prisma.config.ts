import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const directUrl = process.env['DIRECT' + '_URL'];
const pooledUrl = process.env['DATABASE' + '_URL'];

const [command, subcommand] = process.argv.slice(2);
const requiresDirectUrl =
  command === 'migrate' ||
  (command === 'db' && ['push', 'execute'].includes(subcommand ?? ''));

const databaseUrl = requiresDirectUrl ? directUrl : directUrl ?? pooledUrl;

if (!databaseUrl) {
  throw new Error(
    requiresDirectUrl
      ? 'DIRECT_URL is required for Prisma migrations or DB schema changes'
      : 'DATABASE_URL or DIRECT_URL is required for Prisma CLI commands',
  );
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
