/**
 * Application-wide constants.
 */

export const APP_NAME = "StreamVault";

/** Default metadata for SEO */
export const DEFAULT_META = {
  title: APP_NAME,
  description:
    "Discover and stream movies and TV shows with a modern cinematic experience.",
} as const;

/** Route paths */
export const ROUTES = {
  HOME: "/",
  SEARCH: "/search",
  MOVIES: "/search?type=movie",
  TV_SHOWS: "/search?type=tv",
  MOVIE: "/movie", // /movie/[id]
  TV: "/tv", // /tv/[id]
  WATCH: "/watch", // /watch/[id]
  LIBRARY: "/library",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;
