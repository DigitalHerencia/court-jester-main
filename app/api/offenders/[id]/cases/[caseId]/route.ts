import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: { id: string; caseId: string } }) {
  try {
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure offenders can only access their own data
    if (session.role === "offender" && session.offenderId !== Number.parseInt(params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get case details
    const caseResult = await query(
      `
      SELECT 
        c.id, 
        c.case_number, 
        c.offender_id, 
        c.court, 
        c.judge, 
        c.status, 
        c.next_date, 
        c.created_at,
        c.updated_at
      FROM cases c
      WHERE c.id = $1 AND c.offender_id = $2
      `,
      [params.caseId, params.id],
    )

    if (caseResult.rows.length === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Get charges for this case
    const chargesResult = await query(
      `
      SELECT 
        id, 
        description, 
        statute, 
        severity, 
        disposition
      FROM charges
      WHERE case_id = $1
      ORDER BY id
      `,
      [params.caseId],
    )

    // Get hearings for this case
    const hearingsResult = await query(
      `
      SELECT 
        id, 
        date, 
        time, 
        location, 
        type, 
        notes
      FROM hearings
      WHERE case_id = $1
      ORDER BY date, time
      `,
      [params.caseId],
    )

    // Get motions for this case
    const motionsResult = await query(
      `
      SELECT 
        id, 
        title, 
        status, 
        created_at, 
        updated_at
      FROM motions
      WHERE case_id = $1
      ORDER BY created_at DESC
      `,
      [params.caseId],
    )

    return NextResponse.json({
      case: caseResult.rows[0],
      charges: chargesResult.rows,
      hearings: hearingsResult.rows,
      motions: motionsResult.rows,
    })
  } catch (error) {
    console.error("Error fetching case details:", error)
    return NextResponse.json({ error: "Failed to fetch case details" }, { status: 500 })
  }
}

