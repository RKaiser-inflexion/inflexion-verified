import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const url = process.env.DATABASE_URL;
const pooledUrl = url && !url.includes('pgbouncer=true') ? `${url}&pgbouncer=true` : url;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: pooledUrl,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

