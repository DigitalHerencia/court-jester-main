// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { generateToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      console.warn("Login attempt without inmate number");
      return NextResponse.json({ error: "Inmate number is required" }, { status: 400 });
    }

    // Admin Login
    if (credential === process.env.ADMIN_CODE) {
      console.log("Admin login attempt");

      const token = await generateToken({
        role: "admin",
        createdAt: new Date().toISOString(),
        id: "", // Legacy/unused
      });

      ( await cookies() ).set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      console.log("Admin token issued");
      return NextResponse.json({
        success: true,
        role: "admin",
        adminId: process.env.ADMIN_CODE,
      });
    }

    // Offender Login
    const result = await query(
      `SELECT id, inmate_number, status, account_enabled, custody_status FROM offenders WHERE inmate_number = $1`,
      [credential]
    );

    if (!result || result.rowCount === 0) {
      console.log(`New offender registration for inmate_number=${credential}`);
      return NextResponse.json({
        success: true,
        role: "offender",
        newUser: true,
      });
    }

    const offender = result.rows[0];

    if (!offender.account_enabled || offender.status !== "active") {
      console.warn(`Account disabled or inactive for inmate_number=${credential}`);
      return NextResponse.json({ error: "Account is not active. Please contact administration." }, { status: 403 });
    }

    const token = await generateToken({
      offenderId: offender.id,
      role: "offender",
      createdAt: new Date().toISOString(),
      id: "", // Legacy
    });

    ( await cookies() ).set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    try {
      await query(
        `
        INSERT INTO login_activity (
          offender_id,
          activity_type,
          ip_address,
          user_agent,
          created_at
        )
        VALUES ($1, 'login', $2, $3, NOW())
        `,
        [
          offender.id,
          request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "unknown",
          request.headers.get("user-agent") || "unknown",
        ]
      );
      console.log(`Login activity logged for offenderId=${offender.id}`);
    } catch (logError) {
      console.error("Failed to log login activity:", logError);
    }

    return NextResponse.json({
      success: true,
      role: "offender",
      offenderId: offender.inmate_number,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
