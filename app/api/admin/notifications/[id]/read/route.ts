import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Check if notification exists
    const notificationResult = await query("SELECT id FROM admin_notifications WHERE id = $1", [id])

    if (notificationResult.rowCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    // Mark notification as read
    await query("UPDATE admin_notifications SET read = true WHERE id = $1", [id])

    return NextResponse.json({
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}

