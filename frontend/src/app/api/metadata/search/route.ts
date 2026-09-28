import { NextRequest, NextResponse } from "next/server";
import { searchMedia, getMediaByProvider } from "@/lib/metadata";

/**
 * Server-side search API proxy.
 *
 * GET /api/metadata/search?q=...&type=all|movie|tv&page=1&provider=...&watch_region=US
 *
 * Per SECURITY.md: Never exposes TMDB API key to the client.
 * Enforces query sanitization and parameter limits.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const providerParam = searchParams.get("provider") || "";
    const watchRegion = searchParams.get("watch_region") || "US";
    const typeParam = searchParams.get("type") || "all";
    const pageParam = searchParams.get("page") || "1";

    const trimmedQuery = query.trim();
    const trimmedProvider = providerParam.trim();

    // If neither query nor provider is provided, return empty
    if (!trimmedQuery && !trimmedProvider) {
      return NextResponse.json({
        page: 1,
        results: [],
        totalPages: 0,
        totalResults: 0,
      });
    }

    // Validate type parameter
    const type: "all" | "movie" | "tv" =
      typeParam === "movie" || typeParam === "tv" ? typeParam : "all";

    // Validate and clamp page parameter (TMDB limits to 500 pages maximum)
    const pageNum = parseInt(pageParam, 10);
    const page = Number.isInteger(pageNum) ? Math.min(500, Math.max(1, pageNum)) : 1;

    // Default to 24 items per page for a full, balanced 6-column grid
    const pageSizeParam = searchParams.get("pageSize");
    const pageSize = pageSizeParam ? Math.min(50, Math.max(1, parseInt(pageSizeParam, 10) || 24)) : 24;

    let data;
    if (trimmedProvider) {
      const providerId = parseInt(trimmedProvider, 10);
      if (!Number.isInteger(providerId) || providerId <= 0) {
        return NextResponse.json({
          page: 1,
          results: [],
          totalPages: 0,
          totalResults: 0,
        });
      }
      data = await getMediaByProvider(providerId, page, type, watchRegion, pageSize);
    } else {
      // Sanitize query: limit length to 100 characters to avoid excessive payloads
      const sanitizedQuery = trimmedQuery.slice(0, 100);
      data = await searchMedia(sanitizedQuery, page, type, pageSize);
    }

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
