import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable user-friendly error display complying with SECURITY.md.
 * Never leaks stack traces or internal implementation details.
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-red-950/10 border border-red-500/20",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-inner">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-gray-400 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" size="md" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
