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

    // If the user is an offender, ensure they can only access their own settings
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Query offender details for settings
    const offenderSettings = await query(
      `SELECT email, phone FROM offenders WHERE id = $1`,
      [offenderInternalId]
    )

    // Combine database values with default notification preferences
    const settings = {
      ...offenderSettings.rows[0],
      notification_preferences: {
        motion_updates: true,
        new_cases: true,
        system_alerts: true,
      },
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching offender settings:", error)
    return NextResponse.json({ error: "Failed to fetch offender settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure offenders can only update their own settings
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { settings } = await request.json()

    // Convert inmate number to internal id
    const offenderResult = await query(
      `SELECT id FROM offenders WHERE inmate_number = $1`,
      [id]
    )
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const offenderInternalId = offenderResult.rows[0].id

    // Update offender details
    await query(
      `UPDATE offenders 
       SET email = $1, phone = $2
       WHERE id = $3`,
      [settings.email || null, settings.phone || null, offenderInternalId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating offender settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
