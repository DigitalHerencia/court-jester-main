import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"

// Check upcoming court dates and prepare reminder information
export async function GET(request: NextRequest) {
  try {
    // Get all upcoming hearings within the next 7 days that haven't been notified
    const result = await query(`
      SELECT 
        h.id,
        h.hearing_date,
        h.hearing_time,
        h.hearing_type,
        h.court,
        o.id as offender_id,
        np.preferences,
        COALESCE(hn.notification_ids, '{}') as sent_notifications
      FROM hearings h
      JOIN cases c ON h.case_id = c.id
      JOIN offenders o ON c.offender_id = o.id
      LEFT JOIN notification_preferences np ON o.id = np.offender_id
      LEFT JOIN hearing_notifications hn ON h.id = hn.hearing_id
      WHERE 
        h.hearing_date > CURRENT_DATE
        AND h.hearing_date <= CURRENT_DATE + INTERVAL '7 days'
        AND (np.preferences->>'court_date')::boolean = true
      ORDER BY h.hearing_date ASC
    `)

    // Transform the data for the service worker
    const hearings = result.rows.map(hearing => {
      const date = new Date(`${hearing.hearing_date}T${hearing.hearing_time}`)
      const title = `${hearing.hearing_type} at ${hearing.court}`
      
      // Calculate which reminders should be sent
      const reminders = [
        { type: 'reminder', daysBeforeDate: 7 },
        { type: 'reminder', daysBeforeDate: 3 },
        { type: 'warning', daysBeforeDate: 1 },
        { type: 'court_date', daysBeforeDate: 0 }
      ].filter(reminder => {
        const reminderDate = new Date(date)
        reminderDate.setDate(date.getDate() - reminder.daysBeforeDate)
        
        // Only include reminders that haven't been sent yet
        const reminderKey = `${hearing.id}-${reminder.daysBeforeDate}`
        return !hearing.sent_notifications.includes(reminderKey)
      })

      return {
        id: hearing.id,
        date: date.toISOString(),
        title,
        offenderId: hearing.offender_id,
        reminders
      }
    })

    return NextResponse.json({ hearings })
  } catch (error) {
    console.error("Error checking court dates:", error)
    return NextResponse.json(
      { error: "Failed to check court dates" },
      { status: 500 }
    )
  }
}

// Record that a notification was sent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hearingId, notificationId } = body

    // Add the notification ID to the hearing's sent notifications
    await query(`
      INSERT INTO hearing_notifications (hearing_id, notification_ids)
      VALUES ($1, ARRAY[$2])
      ON CONFLICT (hearing_id) DO UPDATE
      SET notification_ids = array_append(
        hearing_notifications.notification_ids, 
        $2
      )
    `, [hearingId, notificationId])

    return NextResponse.json({
      message: "Notification recorded successfully"
    })
  } catch (error) {
    console.error("Error recording notification:", error)
    return NextResponse.json(
      { error: "Failed to record notification" },
      { status: 500 }
    )
  }
}