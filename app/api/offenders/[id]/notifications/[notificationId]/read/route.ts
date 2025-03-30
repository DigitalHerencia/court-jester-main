import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function POST(request: NextRequest, { params }: { params: { id: string; notificationId: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Ensure the user is authorized to access this offender's data
  if (!session || (session.role !== "admin" && session.offenderId !== Number(params.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Mark notification as read, ensuring it belongs to this offender
    const result = await query(
      `UPDATE notifications SET 
        read = true, 
        updated_at = NOW()
      WHERE id = $1 AND recipient_type = 'offender' AND recipient_id = $2
      RETURNING *`,
      [params.notificationId, params.id],
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "An error occurred while updating the notification" }, { status: 500 })
  }
}

