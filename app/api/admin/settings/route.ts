import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await query(`
      SELECT * FROM settings
      ORDER BY key
    `)

    return NextResponse.json({ settings: result.rows })
  } catch (error) {
    console.error("Error fetching settings", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Setting key is required" }, { status: 400 })
    }

    await query(
      `
      UPDATE settings
      SET value = $1, updated_at = CURRENT_TIMESTAMP
      WHERE key = $2
    `,
      [value, key],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating setting", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

