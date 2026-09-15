import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | any;

try {
  if (process.env.DATABASE_URL) {
    prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    });
  } else {
    // Return safe fallback proxy when database is not configured (e.g. using Firebase)
    prismaInstance = new Proxy({}, {
      get: () => () => Promise.resolve([]),
    });
  }
} catch {
  prismaInstance = new Proxy({}, {
    get: () => () => Promise.resolve([]),
  });
}

export const prisma = prismaInstance;
if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
