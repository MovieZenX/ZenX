import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/backend/auth";

/**
 * Registration API Endpoint.
 * POST /api/auth/register
 *
 * Complies with SECURITY.md: Delegates to backend registration service
 * which validates input, hashes password with bcrypt, and never stores plaintext.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, confirmPassword } = body || {};

    const result = await registerUser({
      email,
      username,
      password,
      confirmPassword,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: true,
        user: result.user,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[API /api/auth/register] Error:", (err as Error).message);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
