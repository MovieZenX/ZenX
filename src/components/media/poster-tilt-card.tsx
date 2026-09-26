import type { ReactNode } from "react";

export interface PosterTiltCardProps {
  posterUrl: string | null;
  title: string;
  className?: string;
  children?: ReactNode;
}

/**
 * 3D Hover Moving Poster Card Component.
 *
 * Implements the tactile 3D mouse hover tilt effect from uiverse.io/kennyotsu/witty-deer-12:
 * - 25-zone 3D spatial tracker grid (5x5).
 * - High-speed GPU accelerated rotateX and rotateY transforms.
 * - Dynamic sheen reflection on hover.
 * - Gentle ease-out spring return on mouse leave.
 * - Subtle active press compression feedback.
 */
export function PosterTiltCard({
  posterUrl,
  title,
  className = "",
  children,
}: PosterTiltCardProps) {
  if (!posterUrl) return null;

  return (
    <div
      className={`tilt-card-container group hidden sm:block relative shrink-0 aspect-[2/3] ${className}`}
      aria-label={`${title} Poster`}
    >
      <div className="tilt-canvas">
        {/* 25 Invisible 3D Tracking cells (5x5 grid from uiverse.io witty-deer-12) */}
        <div className="tilt-tracker tilt-tr-1" />
        <div className="tilt-tracker tilt-tr-2" />
        <div className="tilt-tracker tilt-tr-3" />
        <div className="tilt-tracker tilt-tr-4" />
        <div className="tilt-tracker tilt-tr-5" />

        <div className="tilt-tracker tilt-tr-6" />
        <div className="tilt-tracker tilt-tr-7" />
        <div className="tilt-tracker tilt-tr-8" />
        <div className="tilt-tracker tilt-tr-9" />
        <div className="tilt-tracker tilt-tr-10" />

        <div className="tilt-tracker tilt-tr-11" />
        <div className="tilt-tracker tilt-tr-12" />
        <div className="tilt-tracker tilt-tr-13" />
        <div className="tilt-tracker tilt-tr-14" />
        <div className="tilt-tracker tilt-tr-15" />

        <div className="tilt-tracker tilt-tr-16" />
        <div className="tilt-tracker tilt-tr-17" />
        <div className="tilt-tracker tilt-tr-18" />
        <div className="tilt-tracker tilt-tr-19" />
        <div className="tilt-tracker tilt-tr-20" />

        <div className="tilt-tracker tilt-tr-21" />
        <div className="tilt-tracker tilt-tr-22" />
        <div className="tilt-tracker tilt-tr-23" />
        <div className="tilt-tracker tilt-tr-24" />
        <div className="tilt-tracker tilt-tr-25" />

        {/* 3D Tilted Card Body */}
        <div className="tilt-card-body relative rounded-2xl p-[1px] bg-gradient-to-b from-white/25 via-white/10 to-transparent shadow-2xl shadow-black/90">
          <div className="relative w-full h-full rounded-[15px] overflow-hidden bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
