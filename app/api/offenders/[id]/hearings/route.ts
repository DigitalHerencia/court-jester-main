// app/api/offenders/[id]/hearings/route.ts

"use server"

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; caseId: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Await params
    const { id, caseId } = await context.params;
    
    if (session.role === "offender" && session.offenderId !== Number(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const caseIdNum = Number(caseId);
    
    const hearingsQuery = `
      SELECT
        id,
        hearing_date,
        hearing_time,
        hearing_type,
        hearing_judge,
        court,
        court_room,
        status
      FROM hearings
      WHERE case_id = $1
      ORDER BY hearing_date ASC;
    `;
    
    const hearingsResult = await query(hearingsQuery, [caseIdNum]);
    return NextResponse.json({ hearings: hearingsResult.rows });
  } catch (error) {
    console.error("Error fetching hearings:", error);
    return NextResponse.json({ error: "Failed to fetch hearings" }, { status: 500 });
  }
}
