import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/auth";

/**
 * Current Session / Profile API Endpoint.
 * GET /api/auth/me
 *
 * Returns current authenticated user or null.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[API /api/auth/me] Error:", (err as Error).message);
    return NextResponse.json({ user: null });
  }
}
