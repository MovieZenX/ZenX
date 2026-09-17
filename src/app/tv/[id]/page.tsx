import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTvDetails, getTvSeason } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CastList } from "@/components/media/cast-list";
import { TvEpisodesViewer } from "@/components/media/tv-episodes-viewer";
import { ContentCard } from "@/components/media/content-card";
import { ContentRow } from "@/components/media/content-row";

export const revalidate = 86400; // 24 hours ISR cache

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  // Validate ID format before sending upstream
  if (!id || !/^\d+$/.test(id)) {
    return { title: "TV Show Not Found | StreamVault" };
  }

  const tv = await getTvDetails(id);

  if (!tv) {
    return { title: "TV Show Not Found | StreamVault" };
  }

  const yearSuffix = tv.releaseYear ? ` (${tv.releaseYear})` : "";
  const title = `${tv.title}${yearSuffix} — StreamVault`;
  const description =
    tv.overview ||
    `Explore seasons, episodes, cast, and details for ${tv.title} on StreamVault.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: tv.backdropUrl ? [tv.backdropUrl] : tv.posterUrl ? [tv.posterUrl] : [],
      type: "video.tv_show",
    },
  };
}

export default async function TvDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Route validation: Ensure ID is a valid numeric string
  if (!id || !/^\d+$/.test(id)) {
    notFound();
  }

  const tv = await getTvDetails(id);

  if (!tv) {
    notFound();
  }

  // Pre-fetch the first season's episodes server-side for fast initial render
  const initialSeasonNumber = tv.seasons?.[0]?.seasonNumber ?? 1;
  const initialSeason = await getTvSeason(tv.id, initialSeasonNumber);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Backdrop Header Section */}
      <section
        className="relative min-h-[60vh] sm:min-h-[72vh] w-full flex flex-col justify-end overflow-hidden pt-24 sm:pt-32"
        aria-label={`TV Show Details: ${tv.title}`}
      >
        {/* Backdrop Image Container */}
        <div className="absolute inset-0 z-0">
          {tv.backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tv.backdropUrl}
              alt={tv.title}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-900/40 via-surface to-background" />
          )}

          {/* Cinematic Vignettes */}
          <div className="absolute inset-0 vignette-left z-10" />
          <div className="absolute inset-0 vignette-bottom z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60 z-10" />
        </div>

        {/* Hero Information */}
        <Container className="relative z-20 pb-12 sm:pb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* 2:3 Poster Card */}
            {tv.posterUrl ? (
              <div className="w-48 sm:w-56 lg:w-64 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 bg-surface-card hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tv.posterUrl}
                  alt={tv.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex-1 space-y-4 max-w-3xl">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="md">
                  TV Series
                </Badge>

                {tv.rating > 0 && (
                  <Badge variant="rating" size="md">
                    <span>★</span>
                    <span>{tv.rating}</span>
                  </Badge>
                )}

                {tv.voteCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({tv.voteCount.toLocaleString()} votes)
                  </span>
                )}

                {tv.releaseYear && (
                  <span className="text-xs text-gray-300 font-medium">
                    {tv.releaseYear}
                  </span>
                )}

                {tv.duration && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-300 font-medium">
                      {tv.duration}
                    </span>
                  </>
                )}

                {tv.numberOfEpisodes ? (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-300 font-medium">
                      {tv.numberOfEpisodes} Episodes
                    </span>
                  </>
                ) : null}

                {tv.status && (
                  <>
                    <span className="text-gray-500">•</span>
                    <Badge variant="secondary" size="sm">
                      {tv.status}
                    </Badge>
                  </>
                )}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                  {tv.title}
                </h1>
                {tv.tagline ? (
                  <p className="mt-1 text-sm sm:text-base italic text-gray-400">
                    &ldquo;{tv.tagline}&rdquo;
                  </p>
                ) : null}
              </div>

              {/* Genres */}
              {tv.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tv.genres.map((g) => (
                    <Badge key={g} variant="outline" size="sm">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {tv.overview ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed drop-shadow">
                  {tv.overview}
                </p>
              ) : null}

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/watch/${tv.id}?type=tv&season=1&episode=1`}>
                  <Button
                    variant="primary"
                    size="lg"
                    leftIcon={
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    }
                  >
                    Watch Now
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="outline" size="lg">
                    ← Back to Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Details Body */}
      <Container className="space-y-12 pb-20 pt-6">
        {/* Interactive Seasons & Episodes Section */}
        {tv.seasons && tv.seasons.length > 0 && (
          <TvEpisodesViewer
            tvId={tv.id}
            seasons={tv.seasons}
            initialSeason={initialSeason}
          />
        )}

        {/* Cast Presentation */}
        {tv.cast && tv.cast.length > 0 && (
          <CastList cast={tv.cast} title="Series Cast" />
        )}

        {/* Similar TV Shows Carousel */}
        {tv.similar && tv.similar.length > 0 && (
          <ContentRow
            title="More Like This"
            subtitle={`Viewers who watched ${tv.title} also enjoyed`}
          >
            {tv.similar.map((item) => (
              <div key={item.id} className="w-40 sm:w-48 lg:w-56 shrink-0 snap-start">
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
      </Container>
    </div>
  );
}
