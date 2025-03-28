import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Simple query to test the connection
    const testResult = await query("SELECT 1 as test")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      test: testResult.rows[0],
    })
  } catch (error) {
    console.error("Error checking database connection", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

