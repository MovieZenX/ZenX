import type {
  TMDBRawItem,
  TMDBMovieDetail,
  TMDBTvDetail,
  TMDBSeasonDetail,
  TMDBEpisode,
  TMDBCastMember,
} from "@/types/tmdb";
import type {
  MediaItem,
  MediaDetail,
  CastMember,
  SeasonItem,
  EpisodeItem,
} from "@/types/metadata";
import type { ContentType } from "@/types";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Builds a full TMDB image URL for a given path and size.
 */
export function buildImageUrl(
  path: string | null | undefined,
  size: "w300" | "w500" | "w780" | "w1280" | "original" = "w500"
): string | null {
  if (!path || typeof path !== "string" || path.trim() === "") {
    return null;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${cleanPath}`;
}

/**
 * Extracts a 4-digit release year from a date string (YYYY-MM-DD).
 */
export function extractYear(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return Number.isInteger(year) && year > 1880 && year < 2100 ? year : null;
}

/**
 * Formats minutes into human-readable duration (e.g. "2h 14m" or "45m").
 */
export function formatRuntime(minutes?: number | null): string | undefined {
  if (!minutes || minutes <= 0) return undefined;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Normalizes a raw TMDB media item (movie or tv show) into a consistent MediaItem.
 */
export function normalizeTMDBItem(
  raw: TMDBRawItem,
  fallbackType?: ContentType,
  genreMap?: Record<number, string>
): MediaItem {
  const isMovie =
    raw.media_type === "movie" ||
    (!raw.media_type && (fallbackType === "movie" || Boolean(raw.title)));

  const contentType: ContentType = isMovie ? "movie" : "tv";
  const title = raw.title || raw.name || raw.original_title || raw.original_name || "Untitled";
  const dateStr = raw.release_date || raw.first_air_date || null;
  const releaseYear = extractYear(dateStr);

  const genres: string[] = [];
  if (raw.genre_ids && genreMap) {
    for (const gid of raw.genre_ids) {
      const gname = genreMap[gid];
      if (gname) genres.push(gname);
    }
  }

  return {
    id: String(raw.id),
    title,
    overview: raw.overview || "",
    posterUrl: buildImageUrl(raw.poster_path, "w500"),
    backdropUrl: buildImageUrl(raw.backdrop_path, "original"),
    contentType,
    releaseYear,
    releaseDate: dateStr,
    rating: Number(raw.vote_average ? raw.vote_average.toFixed(1) : 0),
    voteCount: raw.vote_count || 0,
    genres,
    quality: "4K",
  };
}

/**
 * Normalizes cast members from credits response.
 */
export function normalizeCast(members?: TMDBCastMember[]): CastMember[] {
  if (!Array.isArray(members)) return [];
  return members.slice(0, 12).map((m) => ({
    id: String(m.id),
    name: m.name || "Unknown",
    character: m.character || "",
    profileUrl: buildImageUrl(m.profile_path, "w300"),
  }));
}

/**
 * Normalizes full movie details into MediaDetail.
 */
export function normalizeMovieDetail(raw: TMDBMovieDetail): MediaDetail {
  const base = normalizeTMDBItem(raw, "movie");
  const genres = raw.genres ? raw.genres.map((g) => g.name) : [];
  const cast = normalizeCast(raw.credits?.cast);
  const similar = (raw.similar?.results || raw.recommendations?.results || [])
    .slice(0, 10)
    .map((item) => normalizeTMDBItem(item, "movie"));

  return {
    ...base,
    genres: genres.length > 0 ? genres : base.genres,
    tagline: raw.tagline || null,
    status: raw.status || "Released",
    runtimeMinutes: raw.runtime || null,
    duration: formatRuntime(raw.runtime),
    cast,
    similar,
  };
}

/**
 * Normalizes full TV details into MediaDetail.
 */
export function normalizeTvDetail(raw: TMDBTvDetail): MediaDetail {
  const base = normalizeTMDBItem(raw, "tv");
  const genres = raw.genres ? raw.genres.map((g) => g.name) : [];
  const cast = normalizeCast(raw.credits?.cast);
  const similar = (raw.similar?.results || raw.recommendations?.results || [])
    .slice(0, 10)
    .map((item) => normalizeTMDBItem(item, "tv"));

  const seasons: SeasonItem[] = (raw.seasons || [])
    .filter((s) => s.season_number > 0) // filter out Season 0 (specials) unless desired
    .map((s) => ({
      id: String(s.id),
      seasonNumber: s.season_number,
      name: s.name || `Season ${s.season_number}`,
      overview: s.overview || "",
      posterUrl: buildImageUrl(s.poster_path, "w500"),
      episodeCount: s.episode_count || 0,
      airDate: s.air_date || null,
    }));

  const seasonCount = raw.number_of_seasons || seasons.length;
  const duration = seasonCount === 1 ? "1 Season" : `${seasonCount} Seasons`;

  return {
    ...base,
    genres: genres.length > 0 ? genres : base.genres,
    tagline: raw.tagline || null,
    status: raw.status || "Returning Series",
    runtimeMinutes: raw.episode_run_time?.[0] || null,
    duration,
    numberOfSeasons: seasonCount,
    numberOfEpisodes: raw.number_of_episodes || 0,
    seasons,
    cast,
    similar,
  };
}

/**
 * Normalizes a TV season detail response with its episodes.
 */
export function normalizeTvSeason(raw: TMDBSeasonDetail): SeasonItem {
  const episodes: EpisodeItem[] = (raw.episodes || []).map((e: TMDBEpisode) => ({
    id: String(e.id),
    episodeNumber: e.episode_number,
    seasonNumber: e.season_number,
    name: e.name || `Episode ${e.episode_number}`,
    overview: e.overview || "",
    stillUrl: buildImageUrl(e.still_path, "w500"),
    airDate: e.air_date || null,
    voteAverage: Number(e.vote_average ? e.vote_average.toFixed(1) : 0),
    duration: formatRuntime(e.runtime),
  }));

  return {
    id: String(raw.id),
    seasonNumber: raw.season_number,
    name: raw.name || `Season ${raw.season_number}`,
    overview: raw.overview || "",
    posterUrl: buildImageUrl(raw.poster_path, "w500"),
    episodeCount: episodes.length,
    airDate: null,
    episodes,
  };
}
