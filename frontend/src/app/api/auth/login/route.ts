import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/backend/auth";

/**
 * Login API Endpoint.
 * POST /api/auth/login
 *
 * Complies with SECURITY.md: Delegates to backend authentication service
 * and returns generic user-facing messages on failure.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body || {};

    const result = await authenticateUser(identifier, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (err) {
    console.error("[API /api/auth/login] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
