// ✅ Path: app/api/offenders/[id]/motions/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract offenderId from path and caseId from the query parameters
    const { id } = await context.params;
    const url = new URL(request.url);
    const caseId = url.searchParams.get("caseId");
    if (!caseId) {
      return NextResponse.json({ error: "caseId parameter is required" }, { status: 400 });
    }

    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "offender" && session.offenderId !== Number(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const caseIdNum = Number(caseId);

    const motionsQuery = `
      SELECT 
        m.id, 
        m.title, 
        m.status, 
        m.filing_date,
        m.created_at
      FROM motion_filings m
      WHERE m.case_id = $1
      ORDER BY m.created_at DESC;
    `;

    const motionsResult = await query(motionsQuery, [caseIdNum]);
    return NextResponse.json({ motions: motionsResult.rows });
  } catch (error) {
    console.error("Error fetching motions:", error);
    return NextResponse.json({ error: "Failed to fetch motions" }, { status: 500 });
  }
}
