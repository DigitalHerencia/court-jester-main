import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to get the inmate number from the URL (e.g., "468079")
    const { id } = await params

    // Retrieve and verify the token from cookies
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Convert inmate number to internal offender id
    const offenderResult = await query(
      `SELECT id FROM offenders WHERE inmate_number = $1`,
      [id],
    )
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const offenderInternalId = offenderResult.rows[0].id

    // If the user is an offender, ensure the session's offenderId matches the internal offender id
    if (session.role === "offender" && session.offenderId !== offenderInternalId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Since there's no "offender_settings" table, return a default settings object.
    const defaultSettings = {
      email: "", // default empty because email isn't stored in the offenders table
      phone: "", // default empty as well
      notification_preferences: {
        motion_updates: true,
        new_cases: true,
        system_alerts: true,
      },
    }

    return NextResponse.json({ settings: defaultSettings })
  } catch (error) {
    console.error("Error fetching offender settings:", error)
    return NextResponse.json({ error: "Failed to fetch offender settings" }, { status: 500 })
  }
}
