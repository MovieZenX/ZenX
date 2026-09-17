"use client";

import { Button } from "@/components/ui";

/**
 * Error boundary UI.
 *
 * Catches uncaught runtime errors in any child route segment.
 * Per SECURITY.md: never exposes stack traces or internal info to users.
 */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
        <svg
          className="h-10 w-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-white">
        Something went wrong
      </h2>
      <p className="mb-8 max-w-md text-gray-400">
        An unexpected error occurred. Please try again. If the problem persists,
        try refreshing the page.
      </p>

      <Button onClick={reset} variant="primary">
        Try again
      </Button>
    </div>
  );
}
