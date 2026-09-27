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
      className={`tilt-card-container group relative shrink-0 aspect-[2/3] ${className}`}
      aria-label={`${title} Poster`}
    >
      <div className="tilt-canvas">
        {/* 25 Invisible 3D Tracking cells (5x5 grid from uiverse.io witty-deer-12) */}
        <div className="tilt-tracker tilt-tr-1 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-2 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-3 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-4 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-5 pointer-events-none sm:pointer-events-auto" />

        <div className="tilt-tracker tilt-tr-6 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-7 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-8 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-9 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-10 pointer-events-none sm:pointer-events-auto" />

        <div className="tilt-tracker tilt-tr-11 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-12 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-13 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-14 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-15 pointer-events-none sm:pointer-events-auto" />

        <div className="tilt-tracker tilt-tr-16 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-17 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-18 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-19 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-20 pointer-events-none sm:pointer-events-auto" />

        <div className="tilt-tracker tilt-tr-21 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-22 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-23 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-24 pointer-events-none sm:pointer-events-auto" />
        <div className="tilt-tracker tilt-tr-25 pointer-events-none sm:pointer-events-auto" />

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
