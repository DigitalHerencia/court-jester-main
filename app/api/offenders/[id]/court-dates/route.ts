// ✅ Path: app/api/offenders/[id]/court-dates/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params to obtain the offender internal id from the URL.
    const { id } = await params;

    // Retrieve and verify the token from cookies.
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use the internal offender id directly.
    const offenderResult = await query(
      `SELECT id FROM offenders WHERE id = $1`,
      [Number(id)]
    );
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 });
    }
    const offenderInternalId = Number(id);

    // Query for court dates (hearing data) for this offender without hearing messages.
    const text = `
      SELECT 
        h.id,
        h.case_id,
        c.case_number,
        h.hearing_date AS date,
        h.hearing_time AS time,
        h.hearing_type AS type,
        h.court AS location,
        h.court_room AS room,
        h.hearing_judge AS judge,
        c.status AS case_status,
        h.created_at
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      WHERE c.offender_id = $1
      ORDER BY h.hearing_date ASC, h.hearing_time ASC
    `;

    const result = await query(text, [offenderInternalId]);

    return NextResponse.json({ courtDates: result.rows });
  } catch (error) {
    console.error("Error fetching court dates:", error);
    return NextResponse.json({ error: "Failed to fetch court dates" }, { status: 500 });
  }
}
