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
      SELECT 
        o.id, o.inmate_number, o.last_name, o.first_name, 
        o.status, o.facility, o.created_at, o.mugshot_url
      FROM offenders o
      ORDER BY o.last_name, o.first_name
    `)

    return NextResponse.json({ offenders: result.rows })
  } catch (error) {
    console.error("Error fetching offenders", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

