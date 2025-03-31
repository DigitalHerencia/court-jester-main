import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to get the inmate number from the URL
    const { id } = await params // 'id' is the inmate number (e.g., "468079")

    // Retrieve and verify token from cookies
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Ensure offender token matches URL inmate number
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Convert inmate number to internal offender id
    const offenderResult = await query(`SELECT id FROM offenders WHERE inmate_number = $1`, [id])
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Since there's no "offender_settings" table, return a default settings object.
    // Optionally, you could check if any settings are stored in the offenders table.
    const defaultSettings = {
      email: "", // default empty since email isn't stored in your offenders table
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

