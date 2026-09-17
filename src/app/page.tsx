import type { Metadata } from "next";
import Link from "next/link";
import {
  getTrendingAll,
  getPopularMovies,
  getPopularTv,
  getNowPlayingMovies,
  getMovieDetails,
  getTvDetails,
} from "@/lib/metadata";
import type { MediaItem } from "@/types/metadata";
import { Hero } from "@/components/media/hero";
import { ContentRow } from "@/components/media/content-row";
import { ContentCard } from "@/components/media/content-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export const revalidate = 3600; // 1 hour ISR revalidation

export const metadata: Metadata = {
  title: "StreamVault — Stream Blockbuster Movies & TV Series",
  description:
    "Discover trending movies, critically acclaimed TV shows, and recent cinematic releases in high definition on StreamVault.",
  openGraph: {
    title: "StreamVault — Stream Blockbuster Movies & TV Series",
    description:
      "Discover trending movies, critically acclaimed TV shows, and recent cinematic releases in high definition.",
    type: "website",
  },
};

function GenreIcon({ name }: { name: string }) {
  const iconClass = "h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3";

  switch (name) {
    case "Action":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "Sci-Fi":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case "Drama":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      );
    case "Animation":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case "Comedy":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Thriller":
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      );
  }
}

const POPULAR_GENRES = [
  { name: "Action", type: "movie", id: 28 },
  { name: "Sci-Fi", type: "movie", id: 878 },
  { name: "Drama", type: "all", id: 18 },
  { name: "Animation", type: "movie", id: 16 },
  { name: "Comedy", type: "all", id: 35 },
  { name: "Thriller", type: "movie", id: 53 },
];

/**
 * Curates items matching any of the specified genre names from loaded collections,
 * avoiding duplicate API requests while maintaining fresh, consistent content.
 */
function extractGenreItems(
  collections: MediaItem[][],
  genres: string[],
  limit = 12
): MediaItem[] {
  const seenIds = new Set<string>();
  const results: MediaItem[] = [];

  for (const list of collections) {
    for (const item of list) {
      if (seenIds.has(item.id)) continue;
      const hasGenre = item.genres?.some((g) =>
        genres.some((target) => g.toLowerCase().includes(target.toLowerCase()))
      );
      if (hasGenre) {
        seenIds.add(item.id);
        results.push(item);
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}

export default async function HomePage() {
  // Fault-tolerant parallel fetching for all core homepage sections
  const [
    trendingResult,
    popularMoviesResult,
    popularTvResult,
    nowPlayingResult,
  ] = await Promise.allSettled([
    getTrendingAll("day"),
    getPopularMovies(),
    getPopularTv(),
    getNowPlayingMovies(),
  ]);

  const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const popularMovies = popularMoviesResult.status === "fulfilled" ? popularMoviesResult.value : [];
  const popularTv = popularTvResult.status === "fulfilled" ? popularTvResult.value : [];
  const nowPlaying = nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [];

  const hasContent =
    trending.length > 0 ||
    popularMovies.length > 0 ||
    popularTv.length > 0 ||
    nowPlaying.length > 0;

  // Graceful fallback if entire TMDB service or credentials fail
  if (!hasContent) {
    return (
      <Container className="py-24 sm:py-32 flex flex-col items-center justify-center">
        <ErrorState
          title="Catalog Service Unavailable"
          message="We are currently unable to reach the media catalog. Please try reloading or check back shortly."
        />
        <div className="mt-6">
          <Link href="/">
            <Button variant="secondary" size="md">
              Reload Page
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  // Select primary featured hero candidate
  const featured = trending[0] ?? popularMovies[0] ?? popularTv[0] ?? null;
  const trendingList = featured ? trending.filter((i) => i.id !== featured.id) : trending;

  // Enrich featured title with duration and full genres if available
  let featuredDuration: string | undefined = undefined;
  let featuredGenres: string[] = featured?.genres ?? [];

  if (featured) {
    try {
      const detail =
        featured.contentType === "movie"
          ? await getMovieDetails(featured.id)
          : await getTvDetails(featured.id);

      if (detail) {
        featuredDuration = detail.duration;
        if (detail.genres && detail.genres.length > 0) {
          featuredGenres = detail.genres;
        }
      }
    } catch {
      // Gracefully fall back to basic metadata without crashing hero
    }
  }

  // Synthesize genre spotlights from loaded metadata (zero redundant API calls)
  const actionSpotlight = extractGenreItems(
    [trending, popularMovies, popularTv, nowPlaying],
    ["Action", "Adventure"],
    12
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Featured Hero Banner */}
      {featured && (
        <Hero
          id={featured.id}
          title={featured.title}
          overview={featured.overview}
          backdropUrl={featured.backdropUrl}
          posterUrl={featured.posterUrl}
          contentType={featured.contentType}
          releaseYear={featured.releaseYear ?? undefined}
          rating={featured.rating}
          duration={featuredDuration}
          genres={featuredGenres}
          quality="4K"
        />
      )}

      <Container className="space-y-12 sm:space-y-16 pb-20 pt-4">
        {/* 2. Trending Now */}
        {trendingList.length > 0 && (
          <ContentRow
            title="Trending Today"
            subtitle="The most watched movies and TV shows right now."
            badge="Hot"
            actionHref="/search"
            actionLabel="Explore All"
          >
            {trendingList.map((item) => (
              <div key={`trend-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                />
              </div>
            ))}
          </ContentRow>
        )}

        {/* 3. Popular Movies */}
        {popularMovies.length > 0 && (
          <ContentRow
            title="Popular Movies"
            subtitle="Top-rated cinematic releases worldwide."
            badge="Movies"
            actionHref="/search?type=movie"
            actionLabel="All Movies"
          >
            {popularMovies.map((item) => (
              <div key={`pop-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                />
              </div>
            ))}
          </ContentRow>
        )}

        {/* 4. Popular TV Shows */}
        {popularTv.length > 0 && (
          <ContentRow
            title="Trending TV Series"
            subtitle="Critically acclaimed series and top streaming seasons."
            badge="Series"
            actionHref="/search?type=tv"
            actionLabel="All TV Shows"
          >
            {popularTv.map((item) => (
              <div key={`tv-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                />
              </div>
            ))}
          </ContentRow>
        )}

        {/* 5. Latest / Now Playing */}
        {nowPlaying.length > 0 && (
          <ContentRow
            title="Now In Theaters & Recent Releases"
            subtitle="Fresh arrivals currently playing and newly available."
            badge="New"
            actionHref="/search"
            actionLabel="Browse Recent"
          >
            {nowPlaying.map((item) => (
              <div key={`np-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                />
              </div>
            ))}
          </ContentRow>
        )}

        {/* 6. Genre-Based Section: Action & Adventure Spotlight */}
        {actionSpotlight.length >= 4 && (
          <ContentRow
            title="Action & Adventure Spotlight"
            subtitle="High-octane blockbusters, heroic tales, and gripping thrillers."
            badge="Spotlight"
            actionHref="/search?q=action&type=movie"
            actionLabel="More Action"
          >
            {actionSpotlight.map((item) => (
              <div key={`action-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                />
              </div>
            ))}
          </ContentRow>
        )}

        {/* 7. Explore by Genre Category Grid */}
        <section className="py-2" aria-labelledby="explore-genre-heading">
          <SectionHeading
            id="explore-genre-heading"
            title="Explore by Genre"
            subtitle="Discover films and series across your favorite categories."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {POPULAR_GENRES.map((genre) => (
              <Link
                key={genre.name}
                href={`/search?q=${encodeURIComponent(genre.name.toLowerCase())}&type=${genre.type}`}
                className="group focus-visible:outline-2 focus-visible:outline-white rounded-xl"
                aria-label={`Explore ${genre.name} movies and TV shows`}
              >
                <Card
                  variant="interactive"
                  className="p-4 sm:p-5 flex flex-col justify-between cursor-pointer border-white/[0.08] transition-all duration-300 group-hover:border-white/25 group-hover:-translate-y-1"
                >
                  <GenreIcon name={genre.name} />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight group-hover:text-gray-200 transition-colors">
                      {genre.name}
                    </h3>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Explore →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
