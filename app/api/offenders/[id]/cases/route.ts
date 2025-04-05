import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // First verify the token and check if they have access to this offender's data
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If not admin, verify the user is accessing their own cases
    if (session.role !== "admin" && session.offenderId !== parseInt(params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch cases with counts of charges and upcoming hearings
    const casesResult = await query(
      `SELECT 
        c.*,
        COUNT(DISTINCT ch.id) as charges_count,
        COUNT(DISTINCT CASE WHEN h.hearing_date > NOW() THEN h.id END) as upcoming_hearings_count
      FROM cases c
      LEFT JOIN charges ch ON c.id = ch.case_id
      LEFT JOIN hearings h ON c.id = h.case_id
      WHERE c.offender_id = $1
      GROUP BY c.id
      ORDER BY 
        CASE WHEN c.status = 'Active' THEN 0 ELSE 1 END,
        c.filing_date DESC`,
      [params.id]
    )

    return NextResponse.json({
      cases: casesResult.rows,
    })
  } catch (error) {
    console.error("Error fetching offender cases:", error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    )
  }
}
