import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check offender access (using internal offender id)
    if (session.role === "offender" && session.offenderId !== Number.parseInt(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get motions for this offender from the motion_filings table
    const result = await query(
      `
        SELECT 
          m.id, 
          m.title, 
          m.status, 
          m.created_at,
          c.case_number
        FROM motion_filings m
        JOIN cases c ON m.case_id = c.id
        WHERE c.offender_id = $1
        ORDER BY m.created_at DESC
      `,
      [id],
    )

    return NextResponse.json({ motions: result.rows })
  } catch (error) {
    console.error("Error fetching offender motions:", error)
    return NextResponse.json({ error: "Failed to fetch motions" }, { status: 500 })
  }
}
