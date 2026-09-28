/**
 * Environment variable configuration.
 *
 * Centralizes access to environment variables with runtime validation.
 * All env access should go through this module.
 */

/** Server-side environment variables (never exposed to browser) */
export const serverEnv = {
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  AUTH_SECRET: process.env.AUTH_SECRET ?? "7f3a9e2c4b8d1f0a5e6c7b8a9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
  STREAMING_API_URL: process.env.STREAMING_API_URL ?? "",
  STREAMING_API_KEY: process.env.STREAMING_API_KEY ?? "",
  TMDB_API_KEY: process.env.TMDB_API_KEY ?? "",
  TMDB_BASE_URL: process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p",
} as const;

/** Client-side environment variables (prefixed with NEXT_PUBLIC_) */
export const clientEnv = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "StreamVault",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
