/*
  PRISMA CLIENT SINGLETON
  
  Why do we need this file?
  
  In development, Next.js hot-reloads your code when you save a file.
  Each reload would normally create a NEW database connection.
  After a few saves, you'd have dozens of open connections → database crashes!
  
  This file solves that by:
  1. Creating ONE Prisma client instance
  2. Storing it in a global variable (survives hot-reloads)
  3. Every file that needs the database imports from HERE
  
  Usage in any file:
    import { prisma } from '@/lib/prisma'
    const users = await prisma.users.findMany()
*/

import { PrismaClient } from '@/lib/generated/prisma'

// Extend the global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Reuse existing instance OR create a new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// In development, save the instance globally so it survives hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
