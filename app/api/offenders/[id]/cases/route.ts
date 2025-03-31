import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the inmate number from the URL
    const { id } = await params // id is expected to be the inmate number (e.g., "468079")

    // Retrieve and verify token
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // If the user is an offender, ensure that the token's offenderId matches the URL id (compare as strings)
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Convert inmate number to internal offender id
    const offenderResult = await query(`SELECT id FROM offenders WHERE inmate_number = $1`, [id])
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const offenderInternalId = offenderResult.rows[0].id

    // Query cases for this offender using the internal offender id
    const casesResult = await query(
      `SELECT id, case_number, court, judge, status, next_date, created_at, updated_at
       FROM cases
       WHERE offender_id = $1
       ORDER BY created_at DESC`,
      [offenderInternalId],
    )
    return NextResponse.json({ cases: casesResult.rows })
  } catch (error) {
    console.error("Error fetching offender cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

