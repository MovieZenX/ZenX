import type { ContentType } from "./index";

/**
 * Normalized media item used for catalog, rows, search results, and cards.
 */
export interface MediaItem {
  id: string; // string representation of the ID
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  logoUrl?: string | null;
  contentType: ContentType;
  releaseYear: number | null;
  releaseDate: string | null;
  rating: number; // 0.0 - 10.0
  voteCount: number;
  genres: string[];
  duration?: string;
  quality?: "4K" | "HD";
  ageRating?: string;
}

export interface CastMember {
  id: string;
  name: string;
  character: string;
  profileUrl: string | null;
}

export interface EpisodeItem {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  name: string;
  overview: string;
  stillUrl: string | null;
  airDate: string | null;
  voteAverage: number;
  duration?: string;
}

export interface SeasonItem {
  id: string;
  seasonNumber: number;
  name: string;
  overview: string;
  posterUrl: string | null;
  episodeCount: number;
  airDate: string | null;
  episodes?: EpisodeItem[];
}

/**
 * Full details for a movie or TV show.
 */
export interface MediaDetail extends MediaItem {
  tagline: string | null;
  status: string;
  runtimeMinutes: number | null;
  cast: CastMember[];
  similar: MediaItem[];
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons?: SeasonItem[];
}

export interface PaginatedResults<T> {
  page: number;
  results: T[];
  totalPages: number;
  totalResults: number;
}
