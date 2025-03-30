import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken } from "@/lib/auth";
import { query } from "@/lib/db/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "offender" || !payload.offenderId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // In production, hash the password before saving
    await query(
      `UPDATE offenders SET 
         password_hash = $1,
         updated_at = NOW()
       WHERE id = $2`,
      [password, payload.offenderId]
    );

    // Generate a new token after confirmation
    const newToken = await generateToken({
      offenderId: payload.offenderId,
      role: "offender",
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      offenderId: payload.offenderId,
    });

    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Password confirmation error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
