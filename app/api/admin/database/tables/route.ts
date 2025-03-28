import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await requireAdmin()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get table counts
    const tables = [
      "users",
      "offenders",
      "past_offenses",
      "cases",
      "charges",
      "hearings",
      "motions",
      "reminders",
      "notifications",
      "settings",
    ]

    const counts: Record<string, number> = {}

    for (const table of tables) {
      try {
        const result = await query(`SELECT COUNT(*) FROM ${table}`)
        counts[table] = Number.parseInt(result.rows[0].count)
      } catch (tableError) {
        console.error(`Error getting count for table ${table}:`, tableError)
        counts[table] = 0
      }
    }

    return NextResponse.json({ counts })
  } catch (error) {
    console.error("Error getting table row counts", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

