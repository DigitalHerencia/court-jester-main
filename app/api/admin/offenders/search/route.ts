import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const searchQuery = request.nextUrl.searchParams.get("q")

    if (!searchQuery) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    // Search for offenders by inmate number, first name, or last name
    const searchResult = await query(
      `SELECT id, inmate_number, first_name, last_name, middle_name, status, mugshot_url
       FROM offenders
       WHERE inmate_number ILIKE $1
       OR first_name ILIKE $1
       OR last_name ILIKE $1
       ORDER BY last_name, first_name
       LIMIT 10`,
      [`%${searchQuery}%`],
    )

    return NextResponse.json({
      success: true,
      offenders: searchResult.rows,
    })
  } catch (error: any) {
    console.error("Error searching offenders:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}

