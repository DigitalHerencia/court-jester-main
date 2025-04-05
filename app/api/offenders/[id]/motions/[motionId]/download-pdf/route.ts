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

    // Get motion details using the motion_filings table and the content column
    const motionResult = await query(
      `
        SELECT m.id, m.content, c.offender_id
        FROM motion_filings m
        JOIN cases c ON m.case_id = c.id
        WHERE m.id = $1 AND c.offender_id = $2
      `,
      [motionId, offenderId],
    )
    if (motionResult.rowCount === 0) {
      return NextResponse.json({ error: "Motion not found" }, { status: 404 })
    }
    const motion = motionResult.rows[0]
    if (!motion.content) {
      return NextResponse.json({ error: "Content not available for this motion" }, { status: 404 })
    }

    // Return the motion content as the response (since pdf_url is not part of the schema)
    return NextResponse.json({ motionContent: motion.content })
  } catch (error) {
    console.error("Error downloading motion content:", error)
    return NextResponse.json({ error: "Failed to download motion content" }, { status: 500 })
  }
}
