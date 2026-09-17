import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CastList } from "@/components/media/cast-list";
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
    return { title: "Movie Not Found | StreamVault" };
  }

  const movie = await getMovieDetails(id);

  if (!movie) {
    return { title: "Movie Not Found | StreamVault" };
  }

  const yearSuffix = movie.releaseYear ? ` (${movie.releaseYear})` : "";
  const title = `${movie.title}${yearSuffix} — StreamVault`;
  const description =
    movie.overview ||
    `Explore cast, synopsis, runtime, and details for ${movie.title} on StreamVault.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: movie.backdropUrl ? [movie.backdropUrl] : movie.posterUrl ? [movie.posterUrl] : [],
      type: "video.movie",
    },
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Route validation: Ensure ID is a valid numeric string per SECURITY.md
  if (!id || !/^\d+$/.test(id)) {
    notFound();
  }

  const movie = await getMovieDetails(id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Backdrop Header Section */}
      <section
        className="relative min-h-[60vh] sm:min-h-[72vh] w-full flex flex-col justify-end overflow-hidden pt-24 sm:pt-32"
        aria-label={`Movie Details: ${movie.title}`}
      >
        {/* Backdrop Image Container */}
        <div className="absolute inset-0 z-0">
          {movie.backdropUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.backdropUrl}
              alt={movie.title}
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
            {movie.posterUrl ? (
              <div className="w-48 sm:w-56 lg:w-64 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 bg-surface-card hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex-1 space-y-4 max-w-3xl">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="md">
                  Movie
                </Badge>

                {movie.rating > 0 && (
                  <Badge variant="rating" size="md">
                    <span>★</span>
                    <span>{movie.rating}</span>
                  </Badge>
                )}

                {movie.voteCount > 0 && (
                  <span className="text-xs text-gray-400">
                    ({movie.voteCount.toLocaleString()} votes)
                  </span>
                )}

                {movie.releaseYear && (
                  <span className="text-xs text-gray-300 font-medium">
                    {movie.releaseYear}
                  </span>
                )}

                {movie.duration && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-300 font-medium">
                      {movie.duration}
                    </span>
                  </>
                )}

                {movie.status && (
                  <>
                    <span className="text-gray-500">•</span>
                    <Badge variant="secondary" size="sm">
                      {movie.status}
                    </Badge>
                  </>
                )}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                  {movie.title}
                </h1>
                {movie.tagline ? (
                  <p className="mt-1 text-sm sm:text-base italic text-gray-300">
                    &ldquo;{movie.tagline}&rdquo;
                  </p>
                ) : null}
              </div>

              {/* Genres */}
              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map((g) => (
                    <Badge key={g} variant="outline" size="sm">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview ? (
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed drop-shadow">
                  {movie.overview}
                </p>
              ) : null}

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href={`/watch/${movie.id}?type=movie`}>
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
        {/* Cast Presentation */}
        {movie.cast && movie.cast.length > 0 && (
          <CastList cast={movie.cast} title="Top Billed Cast" />
        )}

        {/* Similar Movies Carousel */}
        {movie.similar && movie.similar.length > 0 && (
          <ContentRow
            title="More Like This"
            subtitle={`Viewers who watched ${movie.title} also enjoyed`}
          >
            {movie.similar.map((item) => (
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
