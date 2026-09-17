import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieDetails, getTvDetails, getTvSeason } from "@/lib/metadata";
import { WatchTheater } from "@/components/watch/watch-theater";
import { ContentRow } from "@/components/media/content-row";
import { ContentCard } from "@/components/media/content-card";

export const revalidate = 3600; // 1 hour ISR cache

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ season?: string; episode?: string; type?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const type = query.type;
  const season = query.season;
  const episode = query.episode;

  if (!id || !/^\d+$/.test(id)) {
    return { title: "Watch | StreamVault" };
  }

  let media = null;
  if (type === "tv" || season || episode) {
    media = await getTvDetails(id);
  } else if (type === "movie") {
    media = await getMovieDetails(id);
  } else {
    media = (await getMovieDetails(id)) || (await getTvDetails(id));
  }

  if (!media) {
    media = (await getTvDetails(id)) || (await getMovieDetails(id));
  }

  const baseTitle = media?.title || "Watch";
  const title =
    season && episode
      ? `Watch ${baseTitle} S${season} E${episode} — StreamVault`
      : `Watch ${baseTitle} — StreamVault`;

  return {
    title,
    description: media?.overview
      ? `Stream ${media.title} in high definition on StreamVault.`
      : "StreamVault Player",
  };
}

/**
 * Watch / Theater page integrated with VidFast streaming embed.
 * Movies: https://vidfast.vc/movie/{id}?autoPlay=true
 * TV Shows: https://vidfast.vc/tv/{id}/{season}/{episode}?autoPlay=true
 */
export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ season?: string; episode?: string; type?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const type = query.type;
  const seasonParam = query.season;
  const episodeParam = query.episode;

  // Strict route ID validation per SECURITY.md
  if (!id || !/^\d+$/.test(id)) {
    notFound();
  }

  // Resolve media metadata
  let media = null;
  if (type === "tv" || seasonParam || episodeParam) {
    media = await getTvDetails(id);
  } else if (type === "movie") {
    media = await getMovieDetails(id);
  } else {
    media = (await getMovieDetails(id)) || (await getTvDetails(id));
  }

  if (!media) {
    media = (await getTvDetails(id)) || (await getMovieDetails(id));
  }

  if (!media) {
    notFound();
  }

  const contentType = media.contentType === "tv" || type === "tv" ? "tv" : "movie";
  const isTv = contentType === "tv";
  const sNum = isTv ? Math.max(1, parseInt(seasonParam || "1", 10) || 1) : 1;
  const epNum = isTv ? Math.max(1, parseInt(episodeParam || "1", 10) || 1) : 1;

  // Pre-fetch season episode metadata on server for instant hydration
  let initialSeasonData = null;
  if (isTv) {
    initialSeasonData = await getTvSeason(id, sNum);
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Primary Watch Theater with Player, Controls, and Episode Playlist */}
      <WatchTheater
        media={media}
        initialSeasonNumber={sNum}
        initialEpisodeNumber={epNum}
        initialSeasonData={initialSeasonData}
        type={contentType}
      />

      {/* Recommended "More Like This" Section */}
      {media.similar && media.similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-4 border-t border-white/[0.08]">
          <ContentRow
            title="More Like This"
            subtitle={`Recommended titles similar to ${media.title}`}
            actionHref={`/search?q=${encodeURIComponent(media.genres[0] || media.title)}`}
            actionLabel="View More"
          >
            {media.similar.map((item) => (
              <div
                key={item.id}
                className="w-36 sm:w-44 md:w-48 lg:w-52 shrink-0 snap-start"
              >
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
        </section>
      )}
    </main>
  );
}
