import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (prismaInstance) return prismaInstance;

  const url = process.env.DATABASE_URL;
  console.log('[Prisma] DATABASE_URL present:', !!url, '| DB URL:', url?.replace(/:([^:@]+)@/, ':***@'));

  if (!url) {
    throw new Error('[Prisma] DATABASE_URL is not set!');
  }

  // Pass the connection string directly — the adapter parses it and creates its own pool
  const adapter = new PrismaMariaDb(url);
  prismaInstance = new PrismaClient({ adapter } as any);
  return prismaInstance;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
});

export default prisma;
