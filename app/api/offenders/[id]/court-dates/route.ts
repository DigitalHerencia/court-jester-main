import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to get the inmate number from the URL
    const { id } = await params // e.g. "468079"

    // Retrieve and verify token from cookies
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // If the user is an offender, ensure token's offenderId matches URL id (compare as strings)
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Convert inmate number to internal offender id (since related tables reference the numeric id)
    const offenderResult = await query(`SELECT id FROM offenders WHERE inmate_number = $1`, [id])
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const offenderInternalId = offenderResult.rows[0].id

    // Query hearings for this offender, including case_number and notes
    const hearingsResult = await query(
      `
      SELECT h.id,
             h.case_id,
             c.case_number,
             h.hearing_date AS date,
             h.hearing_time AS time,
             h.hearing_type AS type,
             h.court_room AS location,
             h.created_at
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      WHERE c.offender_id = $1
      ORDER BY h.hearing_date ASC
      `,
      [offenderInternalId],
    )
    return NextResponse.json({ courtDates: hearingsResult.rows })
  } catch (error) {
    console.error("Error fetching court dates:", error)
    return NextResponse.json({ error: "Failed to fetch court dates" }, { status: 500 })
  }
}
