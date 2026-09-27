import type { Metadata } from "next";
import Link from "next/link";
import {
  getTrendingAll,
  getPopularMovies,
  getPopularTv,
  getNowPlayingMovies,
  getTopRatedMovies,
  getTopRatedTv,
  getUpcomingMovies,
  getOnTheAirTv,
  getDiscoverGenreMedia,
  getMovieDetails,
  getTvDetails,
  getMediaByProvider,
} from "@/lib/metadata";
import type { MediaItem } from "@/types/metadata";
import { Hero, type HeroSlideItem } from "@/components/media/hero";
import { ContentRow } from "@/components/media/content-row";
import { ContentCard } from "@/components/media/content-card";
import { StreamingPlatforms } from "@/components/media/streaming-platforms";
import { PopularPlatformSection } from "@/components/media/popular-platform-section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  // Fault-tolerant parallel fetching for all core and curated homepage sections
  const [
    trendingResult,
    popularMoviesResult,
    popularTvResult,
    nowPlayingResult,
    popularPlatformResult,
    topRatedMoviesResult,
    topRatedTvResult,
    upcomingMoviesResult,
    onTheAirTvResult,
    animeResult,
    sciFiResult,
    crimeMysteryResult,
  ] = await Promise.allSettled([
    getTrendingAll("day"),
    getPopularMovies(),
    getPopularTv(),
    getNowPlayingMovies(),
    getMediaByProvider(8, 1, "tv"),
    getTopRatedMovies(),
    getTopRatedTv(),
    getUpcomingMovies(),
    getOnTheAirTv(),
    getDiscoverGenreMedia("movie", "16", "popularity.desc"),
    getDiscoverGenreMedia("movie", "878", "popularity.desc"),
    getDiscoverGenreMedia("tv", "80,9648", "popularity.desc"),
  ]);

  const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const popularMovies = popularMoviesResult.status === "fulfilled" ? popularMoviesResult.value : [];
  const popularTv = popularTvResult.status === "fulfilled" ? popularTvResult.value : [];
  const nowPlaying = nowPlayingResult.status === "fulfilled" ? nowPlayingResult.value : [];
  const initialPopularItems =
    popularPlatformResult.status === "fulfilled" ? popularPlatformResult.value.results : [];
  const topRatedMovies = topRatedMoviesResult.status === "fulfilled" ? topRatedMoviesResult.value : [];
  const topRatedTv = topRatedTvResult.status === "fulfilled" ? topRatedTvResult.value : [];
  const upcomingMovies = upcomingMoviesResult.status === "fulfilled" ? upcomingMoviesResult.value : [];
  const onTheAirTv = onTheAirTvResult.status === "fulfilled" ? onTheAirTvResult.value : [];
  const animeItems = animeResult.status === "fulfilled" ? animeResult.value : [];
  const sciFiItems = sciFiResult.status === "fulfilled" ? sciFiResult.value : [];
  const crimeMysteryItems = crimeMysteryResult.status === "fulfilled" ? crimeMysteryResult.value : [];

  const hasContent =
    trending.length > 0 ||
    popularMovies.length > 0 ||
    popularTv.length > 0 ||
    nowPlaying.length > 0 ||
    topRatedMovies.length > 0 ||
    topRatedTv.length > 0;

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

  // Select at least 5 top candidates with backdrops for the dynamic hero slidebar
  const candidateMap = new Map<string, MediaItem>();
  for (const item of [...trending, ...popularMovies, ...popularTv, ...topRatedMovies]) {
    if (item.backdropUrl && !candidateMap.has(item.id)) {
      candidateMap.set(item.id, item);
      if (candidateMap.size >= 5) break;
    }
  }
  const candidates = Array.from(candidateMap.values());

  // Enrich featured slides with durations, genres, and title logos in parallel
  const featuredSlides: HeroSlideItem[] = await Promise.all(
    candidates.map(async (item) => {
      let duration: string | undefined = undefined;
      let genres: string[] = item.genres ?? [];
      let logoUrl: string | null = null;

      try {
        const detail =
          item.contentType === "movie"
            ? await getMovieDetails(item.id)
            : await getTvDetails(item.id);

        if (detail) {
          duration = detail.duration;
          if (detail.genres && detail.genres.length > 0) {
            genres = detail.genres;
          }
          logoUrl = detail.logoUrl ?? null;
        }
      } catch {
        // Gracefully fall back to basic metadata
      }

      return {
        id: item.id,
        title: item.title,
        overview: item.overview,
        backdropUrl: item.backdropUrl,
        posterUrl: item.posterUrl,
        logoUrl,
        contentType: item.contentType,
        releaseYear: item.releaseYear ?? undefined,
        rating: item.rating,
        duration,
        genres,
        quality: "4K",
        ageRating: item.contentType === "tv" ? "TV-MA" : "PG-13",
      };
    })
  );

  const primaryFeaturedId = featuredSlides[0]?.id;
  const trendingList = primaryFeaturedId
    ? trending.filter((i) => i.id !== primaryFeaturedId)
    : trending;

  // Synthesize genre spotlights from loaded metadata (zero redundant API calls)
  const actionSpotlight = extractGenreItems(
    [trending, popularMovies, popularTv, nowPlaying, topRatedMovies],
    ["Action", "Adventure"],
    12
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Dynamic Featured Hero Slider (At Least 5 Slides with Glassmorphic Slidebar) */}
      {featuredSlides.length > 0 && (
        <Hero items={featuredSlides} />
      )}

      <Container className="space-y-12 sm:space-y-16 pb-20 pt-4">
        {/* Streaming Platforms Section (primeshows.org style) */}
        <StreamingPlatforms />

        {/* Popular by Platform Section (primeshows.org style) */}
        <PopularPlatformSection
          initialItems={initialPopularItems}
          initialPlatformId="netflix"
          initialType="tv"
        />

        {/* 2. Trending Now (Top 10 Numbered Row) */}
        {trendingList.length > 0 && (
          <ContentRow
            title="Trending Today"
            subtitle="The most watched movies and TV shows right now."
            badge="Hot"
            actionHref="/search"
            actionLabel="Explore All"
            isNumbered={true}
          >
            {trendingList.map((item, index) => (
              <div
                key={`trend-${item.id}`}
                className={cn(
                  index < 10 ? "w-48 sm:w-56 md:w-64 lg:w-72" : "w-40 sm:w-48 lg:w-56",
                  "shrink-0 snap-start"
                )}
              >
                <ContentCard
                  id={item.id}
                  title={item.title}
                  posterUrl={item.posterUrl}
                  contentType={item.contentType}
                  releaseYear={item.releaseYear}
                  rating={item.rating}
                  quality={item.quality}
                  rank={index < 10 ? index + 1 : undefined}
                  rankColor="white"
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

        {/* 4. All-Time Top Rated Movies */}
        {topRatedMovies.length > 0 && (
          <ContentRow
            title="All-Time Top Rated Masterpieces"
            subtitle="Universally acclaimed cinematic classics with the highest audience and critic scores."
            badge="Masterpieces"
            actionHref="/search?type=movie"
            actionLabel="Explore Top Movies"
          >
            {topRatedMovies.map((item) => (
              <div key={`topm-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 5. Trending TV Series */}
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

        {/* 6. Critically Acclaimed TV Series */}
        {topRatedTv.length > 0 && (
          <ContentRow
            title="Critically Acclaimed TV Series"
            subtitle="Legendary television masterpieces with all-time highest viewer ratings."
            badge="Hall of Fame"
            actionHref="/search?type=tv"
            actionLabel="Explore Series"
          >
            {topRatedTv.map((item) => (
              <div key={`toptv-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 7. Latest / Now Playing */}
        {nowPlaying.length > 0 && (
          <ContentRow
            title="Now In Theaters & Recent Releases"
            subtitle="Fresh arrivals currently playing and newly available."
            badge="In Theaters"
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

        {/* 8. Upcoming & Highly Anticipated Blockbusters */}
        {upcomingMovies.length > 0 && (
          <ContentRow
            title="Upcoming & Highly Anticipated"
            subtitle="Upcoming theatrical blockbusters and streaming premieres to put on your radar."
            badge="Coming Soon"
            actionHref="/search?type=movie"
            actionLabel="Explore Upcoming"
          >
            {upcomingMovies.map((item) => (
              <div key={`upc-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 9. On The Air / Fresh Episodes This Week */}
        {onTheAirTv.length > 0 && (
          <ContentRow
            title="Fresh Episodes Airing This Week"
            subtitle="Current hit television series broadcasting brand-new episodes."
            badge="On The Air"
            actionHref="/search?type=tv"
            actionLabel="Airing Series"
          >
            {onTheAirTv.map((item) => (
              <div key={`ota-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 10. Anime & Animated Universes */}
        {animeItems.length > 0 && (
          <ContentRow
            title="Anime & Animated Universes"
            subtitle="Visually stunning anime masterpieces, animated epics, and illustrated sagas."
            badge="Anime"
            actionHref="/search?q=animation&type=movie"
            actionLabel="More Anime"
          >
            {animeItems.map((item) => (
              <div key={`anime-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 11. Mind-Bending Sci-Fi & Cyberpunk Expeditions */}
        {sciFiItems.length > 0 && (
          <ContentRow
            title="Mind-Bending Sci-Fi & Outer Worlds"
            subtitle="Futuristic civilizations, time loops, artificial intelligence, and cosmic frontiers."
            badge="Sci-Fi"
            actionHref="/search?q=sci-fi&type=movie"
            actionLabel="More Sci-Fi"
          >
            {sciFiItems.map((item) => (
              <div key={`scifi-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 12. Binge-Worthy Crime, Noir & Thrillers */}
        {crimeMysteryItems.length > 0 && (
          <ContentRow
            title="Binge-Worthy Crime, Mystery & Thrillers"
            subtitle="Gripping whodunits, forensic detectives, and suspenseful criminal underworlds."
            badge="Mystery"
            actionHref="/search?q=crime&type=tv"
            actionLabel="More Thrillers"
          >
            {crimeMysteryItems.map((item) => (
              <div key={`crime-${item.id}`} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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

        {/* 13. Genre-Based Section: Action & Adventure Spotlight */}
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

        {/* 14. Explore by Genre Category Grid */}
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
