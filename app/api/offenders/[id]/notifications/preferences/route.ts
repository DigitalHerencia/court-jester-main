import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"

// Get notification preferences for an offender
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(`
      SELECT preferences 
      FROM notification_preferences 
      WHERE offender_id = $1
    `, [params.id])

    if (result.rowCount === 0) {
      // Return default preferences if none exist
      return NextResponse.json({
        preferences: {
          court_date: true,
          motion_status: true,
          system: true,
          warning: true,
          reminder: true
        }
      })
    }

    return NextResponse.json({
      preferences: result.rows[0].preferences
    })
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    )
  }
}

// Save or update notification preferences
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { preferences } = body

    // Validate preferences
    const requiredTypes = ['court_date', 'motion_status', 'system', 'warning', 'reminder']
    const invalidTypes = Object.keys(preferences).filter(type => !requiredTypes.includes(type))
    
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid notification types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Insert or update preferences
    await query(`
      INSERT INTO notification_preferences (offender_id, preferences)
      VALUES ($1, $2)
      ON CONFLICT (offender_id) 
      DO UPDATE SET 
        preferences = $2,
        updated_at = CURRENT_TIMESTAMP
    `, [params.id, JSON.stringify(preferences)])

    return NextResponse.json({
      message: "Notification preferences updated successfully",
      preferences
    })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    )
  }
}