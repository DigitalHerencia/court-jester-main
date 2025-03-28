import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await query(`
      SELECT * FROM notifications
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ notifications: result.rows })
  } catch (error) {
    console.error("Error fetching notifications", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

