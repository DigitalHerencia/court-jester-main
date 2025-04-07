import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"

// Get all upcoming hearings for notification scheduling
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`
      SELECT 
        h.id,
        h.hearing_date,
        h.hearing_time,
        h.hearing_type,
        h.court,
        o.email,
        o.phone
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      JOIN offenders o ON c.offender_id = o.id
      WHERE 
        o.id = $1 
        AND h.hearing_date >= CURRENT_DATE
      ORDER BY h.hearing_date ASC
    `, [params.id])

    return NextResponse.json({
      hearings: result.rows
    })
  } catch (error) {
    console.error("Error fetching hearing notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch hearing notifications" },
      { status: 500 }
    )
  }
}

// Record notification preferences for a hearing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { hearingId, notificationIds } = body

    // Store or update notification settings
    await query(`
      INSERT INTO hearing_notifications (
        hearing_id, 
        notification_ids, 
        created_at, 
        updated_at
      ) 
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (hearing_id) 
      DO UPDATE SET 
        notification_ids = $2,
        updated_at = NOW()
    `, [hearingId, JSON.stringify(notificationIds)])

    return NextResponse.json({
      message: "Hearing notifications scheduled successfully"
    })
  } catch (error) {
    console.error("Error scheduling hearing notifications:", error)
    return NextResponse.json(
      { error: "Failed to schedule hearing notifications" },
      { status: 500 }
    )
  }
}

// Cancel notifications for a hearing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const hearingId = searchParams.get("hearingId")

    if (!hearingId) {
      return NextResponse.json(
        { error: "Hearing ID is required" },
        { status: 400 }
      )
    }

    await query(`
      DELETE FROM hearing_notifications 
      WHERE hearing_id = $1
    `, [hearingId])

    return NextResponse.json({
      message: "Hearing notifications cancelled successfully"
    })
  } catch (error) {
    console.error("Error cancelling hearing notifications:", error)
    return NextResponse.json(
      { error: "Failed to cancel hearing notifications" },
      { status: 500 }
    )
  }
}