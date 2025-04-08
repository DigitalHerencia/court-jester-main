import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth"; // Ensure this is async and returns TokenPayload | null
import { NextResponse } from "next/server";

export async function GET() {
  const token = ( await cookies() ).get("token")?.value;

  if (!token) {
    console.error("❌ Missing auth token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await verifyToken(token); // ⬅️ await the token

    if (!payload) {
      console.warn("❌ Token verification returned null");
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    if (payload.role !== "offender") {
      console.warn(`⛔ Role violation: ${payload.role}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log(`🎯 /api/offenders/me: offenderId=${payload.offenderId}`);
    return NextResponse.json({ offenderId: payload.offenderId });
  } catch (error) {
    console.error("💥 JWT verification failed:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }
}
