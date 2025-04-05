import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string; caseId: string } }) {
  try {
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this offender's data
    if (session.role === "offender" && session.offenderId !== Number.parseInt(params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id, caseId } = params

    // Verify the case belongs to the offender
    const caseResult = await query("SELECT id FROM cases WHERE id = $1 AND offender_id = $2", [caseId, id])

    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Case not found or does not belong to this offender" }, { status: 404 })
    }

    // Get charges for this case
    const chargesResult = await query(
      `
        SELECT 
          id, 
          description, 
          statute, 
          class, 
          disposition
        FROM charges
        WHERE case_id = $1
      `,
      [caseId],
    )

    return NextResponse.json({
      charges: chargesResult.rows,
    })
  } catch (error) {
    console.error("Error fetching case charges:", error)
    return NextResponse.json({ error: "Failed to fetch case charges" }, { status: 500 })
  }
}
