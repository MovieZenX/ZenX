/**
 * Upstream TMDB (The Movie Database) raw API response types.
 *
 * Reference: https://developer.themoviedb.org/reference/intro/getting-started
 */

export interface TMDBRawItem {
  id: number;
  title?: string;
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: "movie" | "tv" | "person";
  release_date?: string; // "YYYY-MM-DD"
  first_air_date?: string; // "YYYY-MM-DD"
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  adult?: boolean;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBGenreListResponse {
  genres: TMDBGenre[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
}

export interface TMDBSeasonSummary {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episode_count: number;
  air_date: string | null;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  runtime?: number | null;
}

export interface TMDBSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episodes: TMDBEpisode[];
}

export interface TMDBLogoImage {
  aspect_ratio?: number;
  height?: number;
  width?: number;
  file_path: string;
  iso_639_1?: string | null;
  iso_3166_1?: string | null;
  vote_average?: number;
  vote_count?: number;
}

export interface TMDBImages {
  backdrops?: Array<{ file_path: string }>;
  posters?: Array<{ file_path: string }>;
  logos?: TMDBLogoImage[];
}

export interface TMDBMovieDetail extends TMDBRawItem {
  tagline: string | null;
  runtime: number | null;
  genres: TMDBGenre[];
  status: string;
  budget?: number;
  revenue?: number;
  credits?: TMDBCredits;
  similar?: TMDBPaginatedResponse<TMDBRawItem>;
  recommendations?: TMDBPaginatedResponse<TMDBRawItem>;
  images?: TMDBImages;
}

export interface TMDBTvDetail extends TMDBRawItem {
  tagline: string | null;
  genres: TMDBGenre[];
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TMDBSeasonSummary[];
  episode_run_time?: number[];
  credits?: TMDBCredits;
  similar?: TMDBPaginatedResponse<TMDBRawItem>;
  recommendations?: TMDBPaginatedResponse<TMDBRawItem>;
  images?: TMDBImages;
}
