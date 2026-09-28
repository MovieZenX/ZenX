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
 * Get all-time top rated movies.
 */
export async function getTopRatedMovies(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/movie/top_rated",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "movie", genreMap));
}

/**
 * Get all-time top rated TV shows.
 */
export async function getTopRatedTv(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/tv/top_rated",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "tv", genreMap));
}

/**
 * Get upcoming movies.
 */
export async function getUpcomingMovies(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/movie/upcoming",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "movie", genreMap));
}

/**
 * Get currently airing / on the air TV shows.
 */
export async function getOnTheAirTv(page: number = 1): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    "/tv/on_the_air",
    { page },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, "tv", genreMap));
}

/**
 * Discover titles by genre from TMDB with custom sort.
 */
export async function getDiscoverGenreMedia(
  type: "movie" | "tv",
  genreIds: string | number,
  sortBy: string = "popularity.desc",
  page: number = 1
): Promise<MediaItem[]> {
  const genreMap = await getGenreMap();
  const data = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
    `/discover/${type}`,
    {
      with_genres: genreIds,
      sort_by: sortBy,
      page,
      include_adult: "false",
    },
    3600
  );

  if (!data?.results) return [];
  return data.results.map((item) => normalizeTMDBItem(item, type, genreMap));
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
 * Known common user shorthand and franchise alias mappings.
 */
const FRANCHISE_ALIASES: Record<string, string> = {
  "dune 2": "Dune: Part Two",
  "dune part 2": "Dune: Part Two",
  "avatar 2": "Avatar: The Way of Water",
  "top gun 2": "Top Gun: Maverick",
  "deadpool 3": "Deadpool Wolverine",
  "gladiator 2": "Gladiator II",
  "inside out 2": "Inside Out 2",
  "spiderman": "Spider-Man",
  "spiderman 2": "Spider-Man 2",
  "spiderman 3": "Spider-Man 3",
  "batman 2": "The Dark Knight",
  "batman 3": "The Dark Knight Rises",
  "fast and furious 7": "Furious 7",
  "fast and furious 8": "The Fate of the Furious",
  "fast and furious 9": "F9",
  "fast and furious 10": "Fast X",
  "fast 9": "F9",
  "fast 10": "Fast X",
  "john wick 4": "John Wick: Chapter 4",
  "mission impossible 7": "Mission: Impossible - Dead Reckoning",
  "avengers 3": "Avengers: Infinity War",
  "avengers 4": "Avengers: Endgame",
};

/** Common search typos mapped directly to standard search queries */
const COMMON_CORRECTIONS: Record<string, string> = {
  oppenhiemer: "oppenheimer",
  openheimer: "oppenheimer",
  interstelar: "interstellar",
  inceptoin: "inception",
  avengrs: "avengers",
  deadpol: "deadpool",
  spiderman: "spider-man",
  gladiater: "gladiator",
  "braking bad": "breaking bad",
  "breking bad": "breaking bad",
  "peaky blinder": "peaky blinders",
  "shutter iland": "shutter island",
  "stranger thing": "stranger things",
  "game of throne": "game of thrones",
};

const POPULAR_SEARCH_TARGETS = [
  "oppenheimer",
  "interstellar",
  "inception",
  "avengers",
  "deadpool",
  "spider-man",
  "batman",
  "superman",
  "gladiator",
  "breaking bad",
  "stranger things",
  "game of thrones",
  "shutter island",
  "pulp fiction",
  "the dark knight",
  "peaky blinders",
  "better call saul",
  "succession",
  "the boys",
  "rick and morty",
  "dune",
  "avatar",
  "matrix",
  "john wick",
  "jurassic park",
  "star wars",
  "harry potter",
  "lord of the rings",
  "fight club",
  "forrest gump",
  "shawshank redemption",
  "squid game",
  "black mirror",
  "the last of us",
  "severance",
  "the bear",
  "nolan",
  "christopher nolan",
  "quentin tarantino",
  "tarantino",
  "cillian murphy",
  "leonardo dicaprio",
  "tom cruise",
  "robert downey jr",
  "keanu reeves",
  "christian bale",
  "brad pitt",
  "ryan reynolds",
  "margot robbie",
  "timothee chalamet",
  "zendaya",
];

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, i) => i);
  let currRow = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    const aChar = a.charAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const bChar = b.charAt(j - 1);
      const cost = aChar === bChar ? 0 : 1;
      const prevVal = prevRow[j] ?? 0;
      const currVal = currRow[j - 1] ?? 0;
      const diagVal = prevRow[j - 1] ?? 0;
      currRow[j] = Math.min(prevVal + 1, currVal + 1, diagVal + cost);
    }
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[n] ?? 0;
}

function findFuzzyCorrection(query: string): string | null {
  const q = query.toLowerCase().trim();
  if (COMMON_CORRECTIONS[q]) return COMMON_CORRECTIONS[q];
  if (q.length < 4) return null;

  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const target of POPULAR_SEARCH_TARGETS) {
    const dist = levenshteinDistance(q, target);
    const maxAllowed = q.length <= 6 ? 1 : 2;
    if (dist <= maxAllowed && dist < bestDistance) {
      bestDistance = dist;
      bestMatch = target;
    }
  }

  return bestMatch;
}

interface TMDBCreditsResponse {
  cast?: (TMDBRawItem & { character?: string })[];
  crew?: (TMDBRawItem & { job?: string; department?: string })[];
}

/**
 * Professional multi-strategy search for movies, TV series, actors, and directors.
 * Supports alias resolution, release year extraction, actor/director filmography discovery,
 * typo tolerance, and intelligent multi-signal relevance scoring.
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

  // 1. Resolve franchise aliases & common typos (e.g. "dune 2" -> "Dune: Part Two", "interstelar" -> "interstellar")
  const lowerQuery = trimmed.toLowerCase();
  const resolvedQuery = FRANCHISE_ALIASES[lowerQuery] || COMMON_CORRECTIONS[lowerQuery] || trimmed;

  // 2. Extract potential 4-digit release year (e.g. "Batman 2022" -> query "Batman", year 2022)
  const yearMatch = resolvedQuery.match(/^(.+?)\s+((?:19|20)\d{2})$/);
  const cleanQuery = yearMatch && yearMatch[1] ? yearMatch[1].trim() : resolvedQuery;
  const targetYear = yearMatch && yearMatch[2] ? parseInt(yearMatch[2], 10) : undefined;
  let effectiveQuery = cleanQuery;

  let endpoint = "/search/multi";
  if (type === "movie") endpoint = "/search/movie";
  if (type === "tv") endpoint = "/search/tv";

  // Build TMDB parameters
  const fetchParams: Record<string, string | number | undefined> = {
    query: cleanQuery,
    include_adult: "false",
  };
  if (targetYear && type === "movie") {
    fetchParams.primary_release_year = targetYear;
  } else if (targetYear && type === "tv") {
    fetchParams.first_air_date_year = targetYear;
  }

  // 3. Primary search via TMDB
  let customRes = await fetchTmdbWithCustomPageSize<TMDBRawItem>(
    (tmdbPage) =>
      tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
        endpoint,
        { ...fetchParams, page: tmdbPage },
        300
      ),
    page,
    pageSize,
    (item) => {
      if (type === "movie") return true;
      if (type === "tv") return true;
      return item.media_type === "movie" || item.media_type === "tv" || item.media_type === "person";
    }
  );

  // 3.5. Typo tolerance: if zero results and on page 1, check fuzzy correction
  if (page === 1 && customRes.results.length === 0) {
    const correction = findFuzzyCorrection(cleanQuery);
    if (correction && correction.toLowerCase() !== cleanQuery.toLowerCase()) {
      effectiveQuery = correction;
      const correctedParams = { ...fetchParams, query: correction };
      const fallbackRes = await fetchTmdbWithCustomPageSize<TMDBRawItem>(
        (tmdbPage) =>
          tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
            endpoint,
            { ...correctedParams, page: tmdbPage },
            300
          ),
        page,
        pageSize,
        (item) => {
          if (type === "movie") return true;
          if (type === "tv") return true;
          return item.media_type === "movie" || item.media_type === "tv" || item.media_type === "person";
        }
      );
      if (fallbackRes.results.length > 0) {
        customRes = fallbackRes;
      }
    }
  }

  // 4. Handle Actor / Director discovery & filmography
  let rawItems = [...customRes.results];
  const personItems = rawItems.filter((i) => i.media_type === "person");
  rawItems = rawItems.filter((i) => i.media_type === "movie" || i.media_type === "tv");

  // If person items were returned or movie/tv results are scarce on page 1, fetch person's top filmography
  if (page === 1 && (personItems.length > 0 || rawItems.length === 0)) {
    let topPersonId: number | null = personItems[0]?.id || null;

    // If no person in results yet and 0 movie/tv items, check /search/person directly
    if (!topPersonId && rawItems.length === 0) {
      try {
        const personSearch = await tmdbFetch<TMDBPaginatedResponse<{ id: number; name: string }>>(
          "/search/person",
          { query: effectiveQuery, page: 1, include_adult: "false" },
          300
        );
        if (personSearch?.results && personSearch.results.length > 0 && personSearch.results[0]) {
          topPersonId = personSearch.results[0].id;
        }
      } catch {
        // Fallback silently
      }
    }

    // If we matched a person (actor or director), fetch their top combined credits
    if (topPersonId) {
      try {
        const credits = await tmdbFetch<TMDBCreditsResponse>(
          `/person/${topPersonId}/combined_credits`,
          {},
          3600
        );

        const personWorks: TMDBRawItem[] = [];
        // Acting credits
        if (credits?.cast && Array.isArray(credits.cast)) {
          personWorks.push(...credits.cast);
        }
        // Directing, writing, producing credits (critical for directors like Nolan, Tarantino, Spielberg)
        if (credits?.crew && Array.isArray(credits.crew)) {
          const directOrKeyCrew = credits.crew.filter(
            (c) =>
              c.job === "Director" ||
              c.department === "Directing" ||
              c.department === "Writing" ||
              c.job === "Producer"
          );
          personWorks.push(...directOrKeyCrew);
        }

        if (personWorks.length > 0) {
          const sortedWorks = personWorks
            .filter((c) => {
              if (!c.poster_path) return false;
              if (type === "movie") return c.media_type === "movie";
              if (type === "tv") return c.media_type === "tv";
              return c.media_type === "movie" || c.media_type === "tv";
            })
            .sort(
              (a, b) =>
                (b.vote_count || 0) * (b.vote_average || 1) -
                (a.vote_count || 0) * (a.vote_average || 1)
            )
            .slice(0, 30);

          rawItems = [...sortedWorks, ...rawItems];
        }
      } catch {
        // Fallback silently
      }
    }

    // Also extract known_for from any person items
    for (const p of personItems) {
      if (p.known_for && Array.isArray(p.known_for)) {
        for (const k of p.known_for) {
          if (k && (k.media_type === "movie" || k.media_type === "tv")) {
            rawItems.push(k);
          }
        }
      }
    }
  }

  // 4.5. If targetYear is specified, also pull matching year items if movie/tv
  if (targetYear && page === 1 && (type === "all" || type === "movie")) {
    try {
      const yearSpecificRes = await tmdbFetch<TMDBPaginatedResponse<TMDBRawItem>>(
        "/search/movie",
        { query: cleanQuery, primary_release_year: targetYear, page: 1 },
        300
      );
      if (yearSpecificRes?.results && yearSpecificRes.results.length > 0) {
        rawItems = [...yearSpecificRes.results, ...rawItems];
      }
    } catch {
      // Fallback silently
    }
  }

  // 5. Deduplicate items by media_type and id
  const seen = new Set<string>();
  const uniqueRawItems: TMDBRawItem[] = [];
  for (const item of rawItems) {
    const key = `${item.media_type || "item"}-${item.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRawItems.push(item);
    }
  }

  // 6. Normalize items
  const results = uniqueRawItems.map((item) =>
    normalizeTMDBItem(item, type === "all" ? undefined : type, genreMap)
  );

  // 7. Intelligent Relevance Scoring & Sorting on Page 1
  if (page === 1 && results.length > 1) {
    const qLower = effectiveQuery.toLowerCase();
    const qTokens = qLower.split(/\s+/).filter(Boolean);

    // Canonical helper that strips leading articles and non-alphanumeric chars
    const cleanCanonical = (str: string) =>
      str
        .toLowerCase()
        .replace(/^(the|a|an)\s+/, "")
        .replace(/[^a-z0-9]/g, "");

    const qCanonical = cleanCanonical(qLower);

    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aCanonical = cleanCanonical(aTitle);
      const bCanonical = cleanCanonical(bTitle);

      let aScore = 0;
      let bScore = 0;

      // Exact title match
      if (aTitle === qLower) aScore += 10000;
      if (bTitle === qLower) bScore += 10000;

      // Canonical title match (e.g. "The Batman" vs "Batman")
      if (aCanonical === qCanonical) aScore += 8000;
      if (bCanonical === qCanonical) bScore += 8000;

      // Starts with
      if (aTitle.startsWith(qLower) || aCanonical.startsWith(qCanonical)) aScore += 5000;
      if (bTitle.startsWith(qLower) || bCanonical.startsWith(qCanonical)) bScore += 5000;

      // Contains query
      if (aTitle.includes(qLower)) aScore += 2500;
      if (bTitle.includes(qLower)) bScore += 2500;

      // Matches all query tokens
      if (qTokens.length > 1) {
        if (qTokens.every((t) => aTitle.includes(t))) aScore += 2000;
        if (qTokens.every((t) => bTitle.includes(t))) bScore += 2000;
      }

      // Explicit target release year match (MASSIVE boost so "batman 2022" ranks The Batman 2022 at top)
      if (targetYear) {
        if (a.releaseYear === targetYear) aScore += 30000;
        if (b.releaseYear === targetYear) bScore += 30000;
      }

      // Popularity and rating weighting
      aScore += Math.min(a.voteCount || 0, 30000) * 0.15 + (a.rating || 0) * 20;
      bScore += Math.min(b.voteCount || 0, 30000) * 0.15 + (b.rating || 0) * 20;

      return bScore - aScore;
    });
  }

  const effectiveTotalResults = Math.max(results.length, customRes.totalResults);
  const effectiveTotalPages = Math.max(1, Math.ceil(effectiveTotalResults / pageSize));

  return {
    page: customRes.page,
    results: results.slice(0, pageSize),
    totalPages: effectiveTotalPages,
    totalResults: effectiveTotalResults,
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
