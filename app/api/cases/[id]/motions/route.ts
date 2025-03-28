import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the case to check if the offender has access
    const caseResult = await query(
      `
      SELECT offender_id FROM cases WHERE id = $1
    `,
      [params.id],
    )

    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const caseData = caseResult.rows[0]

    // Only allow admin or the offender themselves to access their motions
    if (session.role !== "admin" && session.offenderId !== caseData.offender_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get motions for the case
    const motionsResult = await query(
      `
      SELECT * FROM motions WHERE case_id = $1
    `,
      [params.id],
    )

    return NextResponse.json({ motions: motionsResult.rows })
  } catch (error) {
    console.error("Error fetching motions", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

