import { NextRequest, NextResponse } from "next/server";
import { searchMedia } from "@/lib/metadata";

/**
 * Server-side search API proxy.
 *
 * GET /api/metadata/search?q=...&type=all|movie|tv&page=1
 *
 * Per SECURITY.md: Never exposes TMDB API key to the client.
 * Enforces query sanitization and parameter limits.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const typeParam = searchParams.get("type") || "all";
    const pageParam = searchParams.get("page") || "1";

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return NextResponse.json({
        page: 1,
        results: [],
        totalPages: 0,
        totalResults: 0,
      });
    }

    // Sanitize query: limit length to 100 characters to avoid excessive payloads
    const sanitizedQuery = trimmedQuery.slice(0, 100);

    // Validate type parameter
    const type: "all" | "movie" | "tv" =
      typeParam === "movie" || typeParam === "tv" ? typeParam : "all";

    // Validate and clamp page parameter (TMDB limits to 500 pages maximum)
    const pageNum = parseInt(pageParam, 10);
    const page = Number.isInteger(pageNum) ? Math.min(500, Math.max(1, pageNum)) : 1;

    const data = await searchMedia(sanitizedQuery, page, type);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    // Sanitize error per SECURITY.md: Never leak internal error stacks
    console.error("[API /api/metadata/search] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "Failed to fetch search results. Please try again." },
      { status: 500 }
    );
  }
}
