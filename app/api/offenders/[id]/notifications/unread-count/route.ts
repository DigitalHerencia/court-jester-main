import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Ensure the user is authorized to access this offender's data
  if (!session || (session.role !== "admin" && session.offenderId !== Number(params.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Count unread notifications for this offender using the correct user_id column
    const result = await query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1 AND read = false`,
      [params.id],
    )

    return NextResponse.json({
      unreadCount: Number.parseInt(String(result.rows[0].count)),
    })
  } catch (error) {
    console.error("Error counting unread notifications:", error)
    return NextResponse.json({ error: "An error occurred while counting notifications" }, { status: 500 })
  }
}
