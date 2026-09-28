import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovieDetails } from "@/lib/metadata";
import { Container } from "@/components/ui/container";
import { CastList } from "@/components/media/cast-list";
import { ContentCard } from "@/components/media/content-card";
import { ContentRow } from "@/components/media/content-row";
import { BackgroundTrailer } from "@/components/media/background-trailer";
import { PosterTiltCard } from "@/components/media/poster-tilt-card";

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
    <div className="relative flex flex-col min-h-screen bg-black overflow-x-hidden">
      {/* Full-Page Immersive Atmospheric Backdrop & Background Trailer Canvas */}
      <BackgroundTrailer
        backdropUrl={movie.backdropUrl}
        trailerKey={movie.trailerKey}
        title={movie.title}
      />

      {/* Hero Header Information Section */}
      <section
        className="relative z-10 w-full flex flex-col justify-end pt-28 sm:pt-36 pb-12 sm:pb-16"
        aria-label={`Movie Details: ${movie.title}`}
      >
        {/* Hero Information */}
        <Container size="wide" className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-10 items-center sm:items-start">
            {/* 2:3 3D Tilt Poster Card (uiverse.io/kennyotsu/witty-deer-12) */}
            <PosterTiltCard
              posterUrl={movie.posterUrl}
              title={movie.title}
              className="w-44 xs:w-52 sm:w-56 lg:w-64 xl:w-72 mx-auto sm:mx-0 shadow-2xl shrink-0"
            />

            <div className="w-full flex-1 space-y-4 text-left max-w-xl lg:max-w-[540px] xl:max-w-[580px]">
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs font-semibold text-white shadow-sm">
                  Movie
                </span>

                {movie.rating > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/30 text-amber-300 font-semibold text-xs shadow-sm">
                    <span className="text-[11px]">★</span>
                    <span>{movie.rating}</span>
                    {movie.voteCount > 0 && (
                      <span className="text-white/50 text-[11px] font-normal ml-0.5 font-mono">
                        ({movie.voteCount.toLocaleString()} votes)
                      </span>
                    )}
                  </div>
                )}

                {movie.releaseYear && (
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs text-white/90 font-mono shadow-sm">
                    {movie.releaseYear}
                  </span>
                )}

                {movie.duration && (
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-xs text-white/90 font-mono shadow-sm">
                    {movie.duration}
                  </span>
                )}

                {movie.status && (
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-emerald-500/30 text-xs text-emerald-400 font-medium shadow-sm">
                    {movie.status}
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
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
                <div className="flex flex-wrap gap-2 pt-1">
                  {movie.genres.map((g) => (
                    <span
                      key={g}
                      className="px-3.5 py-1 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 border border-white/15 text-xs text-white/80 font-medium transition-colors cursor-default shadow-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview ? (
                <p className="text-sm sm:text-base text-gray-200 leading-relaxed drop-shadow-md max-w-lg lg:max-w-[520px]">
                  {movie.overview}
                </p>
              ) : null}

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href={`/watch/${movie.id}?type=movie`}
                  className="inline-flex items-center gap-2.5 px-7 h-11 sm:h-12 rounded-full bg-white/[0.12] hover:bg-white/[0.22] active:scale-[0.98] border border-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-150 cursor-pointer"
                >
                  <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Now</span>
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 h-11 sm:h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.14] active:scale-[0.98] border border-white/15 text-white/90 font-medium text-sm sm:text-base backdrop-blur-md transition-all duration-150 cursor-pointer"
                >
                  <svg className="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  <span>Back to Catalog</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Details Body */}
      <Container size="wide" className="relative z-10 space-y-12 2xl:space-y-16 pb-24 pt-6">
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
