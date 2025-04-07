import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"

// Get all motion updates that require notifications
export async function GET(
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`
      SELECT 
        m.id,
        m.title,
        m.status,
        m.updated_at,
        o.email,
        o.phone,
        c.case_number
      FROM motion_filings m
      JOIN cases c ON m.case_id = c.id
      JOIN offenders o ON c.offender_id = o.id
      WHERE 
        o.id = $1 
        AND m.updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY m.updated_at DESC
    `, [params.id])

    return NextResponse.json({
      motions: result.rows
    })
  } catch (error) {
    console.error("Error fetching motion notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch motion notifications" },
      { status: 500 }
    )
  }
}

// Send notification for motion status update
export async function POST(
  request: NextRequest) {
  try {
    const body = await request.json()
    const { motionId, notificationSent } = body

    // Record that notification was sent
    await query(`
      UPDATE motion_filings 
      SET 
        notification_sent = $1,
        notification_sent_at = NOW()
      WHERE id = $2
    `, [notificationSent, motionId])

    return NextResponse.json({
      message: "Motion notification status updated"
    })
  } catch (error) {
    console.error("Error updating motion notification status:", error)
    return NextResponse.json(
      { error: "Failed to update motion notification status" },
      { status: 500 }
    )
  }
}