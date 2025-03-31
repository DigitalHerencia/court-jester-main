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

    // Get motion details
    const motionResult = await query(
      `
        SELECT m.id, m.pdf_url, c.offender_id
        FROM motions m
        JOIN cases c ON m.case_id = c.id
        WHERE m.id = $1 AND c.offender_id = $2
      `,
      [motionId, offenderId],
    )
    if (motionResult.rowCount === 0) {
      return NextResponse.json({ error: "Motion not found" }, { status: 404 })
    }
    const motion = motionResult.rows[0]
    if (!motion.pdf_url) {
      return NextResponse.json({ error: "PDF not available for this motion" }, { status: 404 })
    }

    // Log the download
    await query(
      `
        INSERT INTO motion_downloads (motion_id, offender_id, downloaded_at)
        VALUES ($1, $2, NOW())
      `,
      [motionId, offenderId],
    )

    // Return the PDF URL
    return NextResponse.json({ pdfUrl: motion.pdf_url })
  } catch (error) {
    console.error("Error downloading motion PDF:", error)
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 })
  }
}

