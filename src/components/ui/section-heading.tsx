import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

/**
 * Cinematic section heading with optional subtitle, badge, and action link.
 */
export function SectionHeading({
  id,
  title,
  subtitle,
  badge,
  actionHref,
  actionLabel = "View All",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-4 sm:mb-6", className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 id={id} className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>
          {badge && (
            <span className="rounded-full bg-gradient-to-b from-white/[0.22] via-white/[0.12] to-white/[0.05] px-2.5 py-0.5 text-[11px] font-semibold text-white border border-white/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-md">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs sm:text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      {actionHref && (
        <Link
          href={actionHref}
          className="group flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors shrink-0"
        >
          <span>{actionLabel}</span>
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}
