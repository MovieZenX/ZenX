/**
 * StreamVault Backend Module.
 *
 * Houses backend capabilities:
 * - Authentication (Registration, Login, Bcrypt Hashing, AES-256-GCM Sessions)
 * - Database & Prisma client singleton
 */

export * from "./auth";
export * from "./db";
