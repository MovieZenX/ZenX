import path from "node:path";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../../prisma/dev.db")}`;
}

/**
 * Prisma Client Singleton for Backend.
 *
 * In development, Next.js hot-reloads modules on every request which would
 * create many PrismaClient instances. This singleton pattern prevents that
 * by caching the client on globalThis.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();
export const db = prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
