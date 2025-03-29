import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value;
  const session = await requireOffender(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only allow admin or the offender themselves to access their hearings
  if (session.role !== "admin" && session.offenderId !== Number.parseInt(params.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    // Get all cases for the offender
    const casesResult = await query(
      `
      SELECT id, case_number FROM cases WHERE offender_id = $1
    `,
      [params.id],
    )

    if (casesResult.rowCount === 0) {
      return NextResponse.json({ hearings: [] })
    }

    const cases = casesResult.rows
    const hearings = []

    // Get hearings for each case
    for (const caseItem of cases) {
      const hearingsResult = await query(
        `
        SELECT h.*, c.case_number
        FROM hearings h
        JOIN cases c ON h.case_id = c.id
        WHERE h.case_id = $1
        ORDER BY h.hearing_date ASC
      `,
        [caseItem.id],
      )

      hearings.push(...hearingsResult.rows)
    }

    return NextResponse.json({ hearings })
  } catch (error) {
    console.error("Error fetching hearings", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

