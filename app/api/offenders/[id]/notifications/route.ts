import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

// GET route: fetch notifications for an offender
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Ensure the user is authorized to access this offender's notifications
  if (!session || (session.role !== "admin" && session.offenderId !== Number(params.id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch notifications using the correct user_id column
    const result = await query(
      `SELECT 
         id, 
         type, 
         message, 
         read, 
         created_at as "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [params.id],
    )

    return NextResponse.json({
      notifications: result.rows,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "An error occurred while fetching notifications" }, { status: 500 })
  }
}

// POST route: create a notification for an offender (admin only)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Only admins can create notifications
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { type, message } = await request.json()

    // Validate required fields
    if (!type || !message) {
      return NextResponse.json({ error: "Type and message are required" }, { status: 400 })
    }

    // Create notification using the correct user_id column and without updated_at
    const result = await query(
      `INSERT INTO notifications (
         user_id, 
         type, 
         message, 
         read, 
         created_at
       ) VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [params.id, type, message, false],
    )

    return NextResponse.json({
      success: true,
      notification: result.rows[0],
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "An error occurred while creating notification" }, { status: 500 })
  }
}
