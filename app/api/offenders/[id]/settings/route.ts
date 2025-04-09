// ✅ Path: app/api/offenders/[id]/settings/route.ts

import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the internal offender id from the URL.
    const { id } = await params
    const offenderId = Number(id)

    // Retrieve and verify the token from cookies.
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Ensure that if the user is an offender, they can only access their own settings.
    if (session.role === "offender" && String(session.offenderId) !== String(offenderId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Query the offender_settings table using the internal offender id.
    let settingsResult = await query(
      `SELECT email, phone, motion_updates, new_cases, system_alerts 
       FROM offender_settings 
       WHERE offender_id = $1`,
      [offenderId]
    )

    // If no settings record exists, insert default settings and re-query.
    if (settingsResult.rowCount === 0) {
      await query(
        `INSERT INTO offender_settings (offender_id, email, phone, motion_updates, new_cases, system_alerts)
         VALUES ($1, NULL, NULL, true, true, true)`,
        [offenderId]
      )
      settingsResult = await query(
        `SELECT email, phone, motion_updates, new_cases, system_alerts 
         FROM offender_settings 
         WHERE offender_id = $1`,
        [offenderId]
      )
      if (settingsResult.rowCount === 0) {
        return NextResponse.json({ error: "Settings not found" }, { status: 404 })
      }
    }

    const dbSettings = settingsResult.rows[0]

    // Wrap database values in a nested structure expected by the settings page.
    const outputSettings = {
      email: dbSettings.email,
      phone: dbSettings.phone,
      notification_preferences: {
        motion_updates: dbSettings.motion_updates,
        new_cases: dbSettings.new_cases,
        system_alerts: dbSettings.system_alerts,
      },
    }

    return NextResponse.json({ settings: outputSettings })
  } catch (error) {
    console.error("Error fetching offender settings:", error)
    return NextResponse.json({ error: "Failed to fetch offender settings" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const offenderId = Number(id)

    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // Ensure offenders can only update their own settings.
    if (session.role === "offender" && String(session.offenderId) !== String(offenderId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Retrieve settings from the request body.
    const { settings } = await request.json()

    // Update the offender_settings record using the internal offender id.
    await query(
      `UPDATE offender_settings 
       SET email = $1, phone = $2, motion_updates = $3, new_cases = $4, system_alerts = $5, updated_at = CURRENT_TIMESTAMP
       WHERE offender_id = $6`,
      [
        settings.email || null,
        settings.phone || null,
        settings.notification_preferences?.motion_updates ?? true,
        settings.notification_preferences?.new_cases ?? true,
        settings.notification_preferences?.system_alerts ?? true,
        offenderId
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating offender settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
