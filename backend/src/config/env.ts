/**
 * Backend Environment Configuration.
 */

export const serverEnv = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "7f3a9e2c4b8d1f0a5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
  TMDB_API_KEY: process.env.TMDB_API_KEY ?? "",
  TMDB_BASE_URL: process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3",
} as const;
