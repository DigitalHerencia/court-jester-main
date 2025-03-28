import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { resetDatabase, seedDatabase } from "@/lib/db-schema"

export async function POST(request: NextRequest) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Reset the database
    const resetResult = await resetDatabase()

    if (!resetResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to reset database",
          details: resetResult.error,
        },
        { status: 500 },
      )
    }

    // Seed the database
    const seedResult = await seedDatabase()

    if (!seedResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to seed database",
          details: seedResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting database", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

