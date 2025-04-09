// ✅ Path: app/api/offenders/[id]/cases/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params before destructuring to ensure we work with resolved values.
    const { id } = await params;
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "offender" && session.offenderId !== Number(id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch cases for this offender using the internal ID from the URL.
    const casesResult = await query(
      `SELECT 
         id,
         case_number,
         court,
         judge,
         status,
         next_date
       FROM cases 
       WHERE offender_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({
      cases: casesResult.rows,
    });
  } catch (error) {
    console.error("Error fetching offender cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}
