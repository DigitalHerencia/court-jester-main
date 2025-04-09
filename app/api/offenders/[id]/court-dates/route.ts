// ✅ Path: app/api/offenders/[id]/court-dates/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to get the inmate number from the URL
    const { id } = await params

    // Retrieve and verify token from cookies
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // If the user is an offender, ensure token's offenderId matches URL id
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Convert inmate number to internal offender id
    const offenderResult = await query(`SELECT id FROM offenders WHERE inmate_number = $1`, [id])
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const offenderInternalId = offenderResult.rows[0].id

    // Query hearings for this offender, including case info and messages
    const hearingsResult = await query(
      `
      WITH hearing_messages AS (
        SELECT 
          hm.hearing_id,
          json_agg(
            json_build_object(
              'id', hm.id,
              'message', hm.message,
              'created_at', hm.created_at,
              'is_read', hm.is_read
            ) ORDER BY hm.created_at DESC
          ) as messages
        FROM hearing_messages hm
        GROUP BY hm.hearing_id
      )
      SELECT 
        h.id,
        h.case_id,
        c.case_number,
        h.hearing_date AS date,
        h.hearing_time AS time,
        h.hearing_type AS type,
        CONCAT(h.court, CASE WHEN h.court_room IS NOT NULL THEN CONCAT(' - Room ', h.court_room) ELSE '' END) AS location,
        h.hearing_judge AS judge,
        c.status AS case_status,
        h.created_at,
        COALESCE(hm.messages, '[]'::json) as messages
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      LEFT JOIN hearing_messages hm ON h.id = hm.hearing_id
      WHERE c.offender_id = $1
      ORDER BY h.hearing_date ASC, h.hearing_time ASC
      `,
      [offenderInternalId]
    )

    return NextResponse.json({ courtDates: hearingsResult.rows })
  } catch (error) {
    console.error("Error fetching court dates:", error)
    return NextResponse.json({ error: "Failed to fetch court dates" }, { status: 500 })
  }
}
