import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    const type = searchParams.get("type") || ""
    const readStatus = searchParams.get("read")

    // Build query based on provided filters
    // NOTE: Changed table name from "admin_notifications" to "notifications"
    let sql = `
      SELECT 
        id, 
        type, 
        message, 
        "read", 
        created_at
      FROM notifications
    `

    const queryParams: unknown[] = []
    const conditions: string[] = []

    if (type) {
      conditions.push(`type = $${queryParams.length + 1}`)
      queryParams.push(type)
    }

    if (readStatus !== null) {
      conditions.push(`"read" = $${queryParams.length + 1}`)
      queryParams.push(readStatus === "true")
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`
    }

    sql += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)

    // Execute query
    const result = await query(sql, queryParams)

    return NextResponse.json({
      notifications: result.rows,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
