/**
 * Utility: cn() — merge Tailwind class names cleanly.
 *
 * Concatenates class name arguments, filtering out falsy values.
 * Lightweight alternative to `clsx` / `classnames` without a dependency.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
