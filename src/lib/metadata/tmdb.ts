import { serverEnv } from "@/config/env";
import type {
  TMDBRawItem,
  TMDBPaginatedResponse,
  TMDBMovieDetail,
  TMDBTvDetail,
  TMDBSeasonDetail,
  TMDBGenreListResponse,
} from "@/types/tmdb";
import type { MediaItem, MediaDetail, SeasonItem, PaginatedResults } from "@/types/metadata";
import {
  normalizeTMDBItem,
  normalizeMovieDetail,
  normalizeTvDetail,
  normalizeTvSeason,
} from "./normalize";

const BASE_URL = serverEnv.TMDB_BASE_URL || "https://api.themoviedb.org/3";

/**
 * Generic server-side fetch wrapper for TMDB with Next.js ISR/Data Cache.
 * Private API credentials are only sent here on the server.
 */
async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {},
  revalidateSeconds: number = 3600
): Promise<T | null> {
  const apiKey = process.env.TMDB_API_KEY || serverEnv.TMDB_API_KEY;
  if (!apiKey) {
    console.warn("[TMDB] Missing TMDB_API_KEY in environment variables.");
    return null;
  }

  const searchParams = new URLSearchParams();
  searchParams.set("api_key", apiKey);
  searchParams.set("language", "en-US");

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") {
      searchParams.set(key, String(val));
    }
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}?${searchParams.toString()}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: revalidateSeconds },
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 404) return null;
        console.error(`[TMDB] HTTP ${res.status} from ${cleanEndpoint}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === 0) {
        // Wait 300ms before retrying once
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      console.error(`[TMDB] Network error connecting to ${cleanEndpoint}:`, (err as Error).message);
      return null;
    }
  }

  return null;
}

/** Cache genre mappings */
let cachedGenreMap: Record<number, string> | null = null;

/**
 * Fetches combined movie and TV genre names mapped by ID.
 */
export async function getGenreMap(): Promise<Record<number, string>> {
  if (cachedGenreMap) return cachedGenreMap;

  const [movieGenres, tvGenres] = await Promise.all([
    tmdbFetch<TMDBGenreListResponse>("/genre/movie/list", {}, 604800),
    tmdbFetch<TMDBGenreListResponse>("/genre/tv/list", {}, 604800),
  ]);

  const map: Record<number, string> = {};
  if (movieGenres?.genres) {
    for (const g of movieGenres.genres) {
      map[g.id] = g.name;
    }
  }
  if (tvGenres?.genres) {
    for (const g of tvGenres.genres) {
      map[g.id] = g.name;
    }
  }

  cachedGenreMap = map;
  return map;
}

/**
 * Get trending movies and TV shows across all media.
 */
export async function getTrendingAll(
  timeWindow: "day" | "week" = "day"
): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    `/trending/all/${timeWindow}`,
    {},
    3600
  );

  if (!data?.results) return [];
  return data.results
    .filter((i) => i.media_type === "movie" || i.media_type === "tv")
    .map((item) => normalizeTMDBItem(item, undefined, genreMap));
}

/**
 * Get trending movies.
 */
export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week"
): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    `/trending/movie/${timeWindow}`,
    {},
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "movie", genreMap));
}

/**
 * Get popular movies.
 */
export async function getPopularMovies(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/movie/popular",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "movie", genreMap));
}

/**
 * Get popular TV shows.
 */
export async function getPopularTv(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/tv/popular",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "tv", genreMap));
}

/**
 * Get latest / now playing movies.
 */
export async function getNowPlayingMovies(): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/movie/now_playing",
    {},
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "movie", genreMap));
}

/**
 * Helper to fetch a custom page size (e.g. 24 items) from a TMDB endpoint
 * that natively returns 20 items per page.
 */
async function fetchTmdbWithCustomPageSize<T extends TMDBRawItem>(
  fetchPage: (tmdbPage: number) => Promise<TMDBPaginatedResponse<T> | null>,
  uiPage: number,
  pageSize: number = 24,
  filterFn?: (item: T) => boolean
): Promise<{
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
}> {
  const TMDB_PER_PAGE = 20;
  const startIndex = (uiPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const startTmdbPage = Math.floor(startIndex / TMDB_PER_PAGE) + 1;
  const endTmdbPage = Math.floor((endIndex - 1) / TMDB_PER_PAGE) + 1;

  if (startTmdbPage > 500) {
    return { results: [], page: uiPage, totalPages: 0, totalResults: 0 };
  }

  const cappedEndPage = Math.min(endTmdbPage, 500);

  // Fetch needed TMDB pages in parallel
  const [firstRes, secondRes] = await Promise.all([
    fetchPage(startTmdbPage),
    startTmdbPage < cappedEndPage ? fetchPage(cappedEndPage) : Promise.resolve(null),
  ]);

  if (!firstRes?.results) {
    return { results: [], page: uiPage, totalPages: 0, totalResults: 0 };
  }

  const raw1 = firstRes.results || [];
  const raw2 = secondRes?.results || [];
  let combined = [...raw1, ...raw2];

  if (filterFn) {
    combined = combined.filter(filterFn);
  }

  const sliceOffsetStart = startIndex - (startTmdbPage - 1) * TMDB_PER_PAGE;
  const sliceOffsetEnd = sliceOffsetStart + pageSize;

  // If filtered items are fewer than requested and TMDB has more pages, fetch next page
  let currentFetchPage = cappedEndPage;
  while (
    combined.length < sliceOffsetEnd &&
    currentFetchPage < Math.min(firstRes.total_pages || 0, 500)
  ) {
    currentFetchPage++;
    const nextRes = await fetchPage(currentFetchPage);
    if (!nextRes?.results?.length) break;
    const nextFiltered = filterFn
      ? nextRes.results.filter(filterFn)
      : nextRes.results;
    combined.push(...nextFiltered);
  }

  const pageResults = combined.slice(sliceOffsetStart, sliceOffsetEnd);
  const totalResults = firstRes.total_results || 0;
  const maxAccessibleItems = Math.min(totalResults, 500 * TMDB_PER_PAGE);
  const totalPages = Math.min(
    Math.ceil(totalResults / pageSize),
    Math.ceil(maxAccessibleItems / pageSize)
  );

  return {
    results: pageResults,
    page: uiPage,
    totalPages,
    totalResults,
  };
}

/**
 * Search movies and/or TV shows with query and pagination.
 * Supports custom page sizes (defaults to 24 for a complete 6-column grid).
 */
export async function searchMedia(
  query: string,
  page: number = 1,
  type: "all" | "movie" | "tv" = "all",
  pageSize: number = 24
): Promise<PaginatedResults<MediaItem>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { page: 1, results: [], totalPages: 0, totalResults: 0 };
  }

  const genreMap = await getGenreMap();
  let endpoint = "/search/multi";
  if (type === "movie") endpoint = "/search/movie";
  if (type === "tv") endpoint = "/search/tv";

  const customRes = await fetchTmdbWithCustomPageSize<TMDBRawItem>(
    (tmdbPage) =>
      tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
        endpoint,
        { query: trimmed, page: tmdbPage, include_adult: "false" },
        300 // 5 minute cache for searches
      ),
    page,
    pageSize,
    (item) => {
      if (type === "movie") return true;
      if (type === "tv") return true;
      return item.media_type === "movie" || item.media_type === "tv";
    }
  );

  const results = customRes.results.map((item) =>
    normalizeTMDBItem(item, type === "all" ? undefined : type, genreMap)
  );

  return {
    page: customRes.page,
    results,
    totalPages: customRes.totalPages,
    totalResults: customRes.totalResults,
  };
}

/**
 * Get comprehensive movie details, including cast and similar movies.
 */
export async function getMovieDetails(id: string | number): Promise<MediaDetail | null> {
  const raw = await tmdbFetch<TMDBMovieDetail>(
    `/movie/${id}`,
    { append_to_response: "credits,similar,images,videos" },
    86400
  );

  if (!raw || !raw.id) return null;
  return normalizeMovieDetail(raw);
}

/**
 * Get comprehensive TV show details, including seasons, cast, and similar shows.
 */
export async function getTvDetails(id: string | number): Promise<MediaDetail | null> {
  const raw = await tmdbFetch<TMDBTvDetail>(
    `/tv/${id}`,
    { append_to_response: "credits,similar,images,videos" },
    86400
  );

  if (!raw || !raw.id) return null;
  return normalizeTvDetail(raw);
}

/**
 * Get episodes for a specific TV show season.
 */
export async function getTvSeason(
  id: string | number,
  seasonNumber: number
): Promise<SeasonItem | null> {
  const raw = await tmdbFetch<TMDBSeasonDetail>(
    `/tv/${id}/season/${seasonNumber}`,
    {},
    86400
  );

  if (!raw || !raw.id) return null;
  return normalizeTvSeason(raw);
}

/**
 * Discover movies and/or TV shows available on a specific watch provider.
 */
export async function getMediaByProvider(
  providerId: string | number,
  page: number = 1,
  type: "all" | "movie" | "tv" = "all",
  watchRegion: string = "US",
  pageSize: number = 24
): Promise<PaginatedResults<MediaItem>> {
  const genreMap = await getGenreMap();

  if (type === "movie") {
    const customRes = await fetchTmdbWithCustomPageSize<TMDBRawItem>(
      (tmdbPage) =>
        tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
          "/discover/movie",
          {
            with_watch_providers: providerId,
            watch_region: watchRegion,
            sort_by: "popularity.desc",
            page: tmdbPage,
            include_adult: "false",
          },
          3600
        ),
      page,
      pageSize
    );

    return {
      page: customRes.page,
      results: customRes.results.map((item) => normalizeTMDBItem(item, "movie", genreMap)),
      totalPages: customRes.totalPages,
      totalResults: customRes.totalResults,
    };
  }

  if (type === "tv") {
    const customRes = await fetchTmdbWithCustomPageSize<TMDBRawItem>(
      (tmdbPage) =>
        tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
          "/discover/tv",
          {
            with_watch_providers: providerId,
            watch_region: watchRegion,
            sort_by: "popularity.desc",
            page: tmdbPage,
            include_adult: "false",
          },
          3600
        ),
      page,
      pageSize
    );

    return {
      page: customRes.page,
      results: customRes.results.map((item) => normalizeTMDBItem(item, "tv", genreMap)),
      totalPages: customRes.totalPages,
      totalResults: customRes.totalResults,
    };
  }

  // type === "all": fetch half movies and half tv shows to form 24 items interleaved
  const halfPageSize = Math.max(1, Math.floor(pageSize / 2));
  const [movieRes, tvRes] = await Promise.all([
    fetchTmdbWithCustomPageSize<TMDBRawItem>(
      (tmdbPage) =>
        tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
          "/discover/movie",
          {
            with_watch_providers: providerId,
            watch_region: watchRegion,
            sort_by: "popularity.desc",
            page: tmdbPage,
            include_adult: "false",
          },
          3600
        ),
      page,
      halfPageSize
    ),
    fetchTmdbWithCustomPageSize<TMDBRawItem>(
      (tmdbPage) =>
        tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
          "/discover/tv",
          {
            with_watch_providers: providerId,
            watch_region: watchRegion,
            sort_by: "popularity.desc",
            page: tmdbPage,
            include_adult: "false",
          },
          3600
        ),
      page,
      halfPageSize
    ),
  ]);

  const movies = movieRes.results.map((i) => normalizeTMDBItem(i, "movie", genreMap));
  const tvs = tvRes.results.map((i) => normalizeTMDBItem(i, "tv", genreMap));

  const combined: MediaItem[] = [];
  const maxLen = Math.max(movies.length, tvs.length);
  for (let i = 0; i < maxLen; i++) {
    const movie = movies[i];
    if (movie) combined.push(movie);
    const tv = tvs[i];
    if (tv) combined.push(tv);
  }

  const totalPages = Math.max(movieRes.totalPages, tvRes.totalPages);
  const totalResults = movieRes.totalResults + tvRes.totalResults;

  return {
    page,
    results: combined.slice(0, pageSize),
    totalPages,
    totalResults,
  };
}
