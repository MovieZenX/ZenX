import Link from "next/link";
import { Button } from "@/components/ui";
import { ROUTES } from "@/config";

/**
 * 404 Not Found page.
 *
 * Displayed when a requested route does not exist.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* Large 404 */}
      <h1 className="text-gradient mb-2 text-8xl font-black tracking-tighter sm:text-9xl">
        404
      </h1>

      <h2 className="mb-2 text-xl font-semibold text-white sm:text-2xl">
        Page not found
      </h2>
      <p className="mb-8 max-w-md text-gray-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link href={ROUTES.HOME}>
        <Button variant="primary">Back to Home</Button>
      </Link>
    </div>
  );
}
