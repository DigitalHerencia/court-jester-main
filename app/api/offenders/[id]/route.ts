import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only allow admin or the offender themselves to access their profile
  if (session.role !== "admin" && session.offenderId !== Number.parseInt(params.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get offender details
    const offenderResult = await query(
      `
      SELECT * FROM offenders WHERE id = $1
    `,
      [params.id],
    )

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    const offender = offenderResult.rows[0]

    // Get past offenses
    const pastOffensesResult = await query(
      `
      SELECT * FROM past_offenses WHERE offender_id = $1
    `,
      [params.id],
    )

    // Get cases
    const casesResult = await query(
      `
      SELECT * FROM cases WHERE offender_id = $1
    `,
      [params.id],
    )

    const cases = []

    for (const caseRow of casesResult.rows) {
      // Get charges for this case
      const chargesResult = await query(
        `
        SELECT * FROM charges WHERE case_id = $1
      `,
        [caseRow.id],
      )

      // Get hearings for this case
      const hearingsResult = await query(
        `
        SELECT * FROM hearings WHERE case_id = $1
      `,
        [caseRow.id],
      )

      cases.push({
        ...caseRow,
        charges: chargesResult.rows,
        hearings: hearingsResult.rows,
      })
    }

    return NextResponse.json({
      offender,
      pastOffenses: pastOffensesResult.rows,
      cases,
    })
  } catch (error) {
    console.error("Error fetching offender", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

