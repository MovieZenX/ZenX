import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[API /api/auth/me] Backend forward error:", (err as Error).message);
    return NextResponse.json({ user: null });
  }
}
