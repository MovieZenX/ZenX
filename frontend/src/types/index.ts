/**
 * Shared TypeScript types for the application.
 *
 * Types are derived from the documented database schema (DATABASE.md)
 * and API contract (API.md). Do not add undocumented fields.
 */

// ─── Content Types ───────────────────────────────────────────────

/** The type of content — movie or TV show */
export type ContentType = "movie" | "tv";

// ─── Database Entity Types (from DATABASE.md) ────────────────────

/** User entity — matches `users` table */
export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Watchlist entry — matches `watchlist` table */
export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  createdAt: Date;
}

/** Watch history entry — matches `watch_history` table */
export interface WatchHistoryItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  season: number | null;
  episode: number | null;
  progress: number;
  duration: number;
  lastWatched: Date;
}

/** User preferences — matches `user_preferences` table */
export interface UserPreferences {
  id: string;
  userId: string;
  language: string;
  autoplay: boolean;
  preferredQuality: string;
  subtitlesEnabled: boolean;
}

// ─── API Types (from API.md) ─────────────────────────────────────

/** A single streaming source from the streaming API */
export interface StreamingSource {
  url: string;
  type: string;
  quality: string;
}

/** Response from the streaming API's get-source endpoint */
export interface StreamingSourceResponse {
  sources: StreamingSource[];
}

// ─── UI Types ────────────────────────────────────────────────────

/** Generic API response wrapper for internal use */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
