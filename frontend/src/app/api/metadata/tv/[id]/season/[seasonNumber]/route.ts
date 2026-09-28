import { NextRequest, NextResponse } from "next/server";
import { getTvSeason } from "@/lib/metadata";

/**
 * Server-side TV season metadata proxy.
 *
 * GET /api/metadata/tv/[id]/season/[seasonNumber]
 *
 * Per SECURITY.md: Validates route parameters and never exposes upstream keys or raw errors.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; seasonNumber: string }> }
) {
  try {
    const { id, seasonNumber } = await params;

    // Validate TV ID is a numeric string
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid TV series ID format." },
        { status: 400 }
      );
    }

    // Validate Season Number is an integer
    const seasonNum = parseInt(seasonNumber, 10);
    if (!Number.isInteger(seasonNum) || seasonNum < 0) {
      return NextResponse.json(
        { error: "Invalid season number format." },
        { status: 400 }
      );
    }

    const season = await getTvSeason(id, seasonNum);

    if (!season) {
      return NextResponse.json(
        { error: "Season data not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(season, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err) {
    console.error("[API /api/metadata/tv/season] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "Failed to retrieve season information." },
      { status: 500 }
    );
  }
}
