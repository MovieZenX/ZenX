import type { CastMember } from "@/types/metadata";
import { cn } from "@/lib/utils";

export interface CastListProps {
  cast: CastMember[];
  title?: string;
  className?: string;
}

/**
 * Reusable cast presentation component displaying circular actor portraits,
 * character names, and graceful fallback avatars.
 */
export function CastList({
  cast,
  title = "Top Billed Cast",
  className,
}: CastListProps) {
  if (!cast || cast.length === 0) return null;

  // Display a sensible number of top billed cast members
  const displayedCast = cast.slice(0, 12);

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
        {title}
      </h2>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
        {displayedCast.map((actor) => (
          <div
            key={actor.id}
            className="w-24 sm:w-28 shrink-0 flex flex-col items-center text-center group snap-start"
          >
            {/* Circular Profile Avatar */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full p-[1.5px] bg-gradient-to-b from-white/20 via-white/5 to-transparent group-hover:from-white/40 transition-all duration-300 shadow-lg mb-2.5">
              <div className="h-full w-full rounded-full overflow-hidden bg-black/40">
                {actor.profileUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={actor.profileUrl}
                    alt={actor.name}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/[0.05] text-xs text-gray-400 font-bold">
                    {actor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "NA"}
                  </div>
                )}
              </div>
            </div>

            {/* Actor Name & Character Role */}
            <span
              className="text-xs font-semibold text-white line-clamp-1 group-hover:text-gray-300 transition-colors"
              title={actor.name}
            >
              {actor.name}
            </span>
            <span
              className="text-[11px] text-gray-400 line-clamp-1 mt-0.5"
              title={actor.character}
            >
              {actor.character || "Cast"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
