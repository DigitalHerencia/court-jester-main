import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Test database connection by running a simple query
    const result = await query("SELECT 1 as connected")

    return NextResponse.json({
      success: true,
      connected: true,
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: "Failed to connect to database",
      },
      { status: 500 },
    )
  }
}

