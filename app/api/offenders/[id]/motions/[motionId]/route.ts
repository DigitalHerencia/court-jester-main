import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; motionId: string }> }) {
  try {
    const { id: offenderId, motionId } = await params
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check offender access
    if (session.role === "offender" && session.offenderId !== Number.parseInt(offenderId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get motion details with case info using the motion_filings table
    const motionResult = await query(
      `
        SELECT 
          m.id, m.title, m.content, m.status, m.created_at, m.updated_at,
          c.id as case_id, c.case_number, c.court, c.judge
        FROM motion_filings m
        JOIN cases c ON m.case_id = c.id
        WHERE m.id = $1 AND c.offender_id = $2
      `,
      [motionId, Number.parseInt(offenderId)],
    )
    if (motionResult.rowCount === 0) {
      return NextResponse.json({ error: "Motion not found" }, { status: 404 })
    }
    const motion = motionResult.rows[0]

    // Format and return response
    return NextResponse.json({
      motion: {
        id: motion.id,
        title: motion.title,
        content: motion.content,
        status: motion.status,
        created_at: motion.created_at,
        updated_at: motion.updated_at,
        case: {
          id: motion.case_id,
          case_number: motion.case_number,
          court: motion.court,
          judge: motion.judge,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching motion details:", error)
    return NextResponse.json({ error: "Failed to fetch motion details" }, { status: 500 })
  }
}
