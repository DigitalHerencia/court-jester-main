import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Get offender details
    const offenderResult = await query(
      `
        SELECT 
          id, 
          inmate_number, 
          first_name, 
          last_name, 
          middle_name, 
          status, 
          facility, 
          age, 
          height, 
          weight, 
          eye_color, 
          hair, 
          ethnicity, 
          mugshot_url, 
          created_at, 
          updated_at
        FROM offenders
        WHERE id = $1
      `,
      [id],
    )

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    const offender = offenderResult.rows[0]

    // Get cases for this offender
    const casesResult = await query(
      `
        SELECT 
          id, 
          case_number, 
          court, 
          judge, 
          status, 
          next_date
        FROM cases
        WHERE offender_id = $1
        ORDER BY created_at DESC
      `,
      [id],
    )

    // Get notifications for this offender
    const notificationsResult = await query(
      `
        SELECT 
          id, 
          type, 
          message, 
          read, 
          created_at
        FROM offender_notifications
        WHERE offender_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `,
      [id],
    )

    return NextResponse.json({
      offender,
      cases: casesResult.rows,
      notifications: notificationsResult.rows,
    })
  } catch (error) {
    console.error("Error fetching offender details:", error)
    return NextResponse.json({ error: "Failed to fetch offender details" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // Validate required fields
    const { inmate_number, first_name, last_name, status } = body

    if (!inmate_number || !first_name || !last_name || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if offender exists
    const existingOffender = await query("SELECT id FROM offenders WHERE id = $1", [id])

    if (existingOffender.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Check if inmate number is already used by another offender
    const duplicateCheck = await query("SELECT id FROM offenders WHERE inmate_number = $1 AND id != $2", [
      inmate_number,
      id,
    ])
    
    if (duplicateCheck && duplicateCheck.rowCount !== null && duplicateCheck.rowCount > 0) {
      return NextResponse.json({ error: "Another offender with this inmate number already exists" }, { status: 409 })
    }
    // Update offender
    await query(
      `
        UPDATE offenders
        SET 
          inmate_number = $1,
          first_name = $2,
          last_name = $3,
          middle_name = $4,
          status = $5,
          facility = $6,
          age = $7,
          height = $8,
          weight = $9,
          eye_color = $10,
          hair = $11,
          ethnicity = $12,
          notes = $13,
          updated_at = NOW()
        WHERE id = $14
      `,
      [
        inmate_number,
        first_name,
        last_name,
        body.middle_name || null,
        status,
        body.facility || null,
        body.age || null,
        body.height || null,
        body.weight || null,
        body.eye_color || null,
        body.hair || null,
        body.ethnicity || null,
        body.notes || null,
        id,
      ],
    )

    // Create notification if requested
    if (body.send_notification) {
      await query(
        `
          INSERT INTO offender_notifications (
            offender_id,
            type,
            message,
            read,
            created_at
          )
          VALUES ($1, $2, $3, $4, NOW())
        `,
        [id, "profile_update", "Your profile information has been updated by an administrator.", false],
      )
    }

    return NextResponse.json({
      message: "Offender updated successfully",
    })
  } catch (error) {
    console.error("Error updating offender:", error)
    return NextResponse.json({ error: "Failed to update offender" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Check if offender exists
    const existingOffender = await query("SELECT id FROM offenders WHERE id = $1", [id])

    if (existingOffender.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Delete related records first (using a transaction)
    await query("BEGIN")

    try {
      // Delete offender notifications
      await query("DELETE FROM offender_notifications WHERE offender_id = $1", [id])

      // Delete motions related to offender's cases
      await query(
        `
        DELETE FROM motions 
        WHERE case_id IN (SELECT id FROM cases WHERE offender_id = $1)
      `,
        [id],
      )

      // Delete court dates related to offender's cases
      await query(
        `
        DELETE FROM court_dates 
        WHERE case_id IN (SELECT id FROM cases WHERE offender_id = $1)
      `,
        [id],
      )

      // Delete charges related to offender's cases
      await query(
        `
        DELETE FROM charges 
        WHERE case_id IN (SELECT id FROM cases WHERE offender_id = $1)
      `,
        [id],
      )

      // Delete cases
      await query("DELETE FROM cases WHERE offender_id = $1", [id])

      // Delete offender settings
      await query("DELETE FROM offender_settings WHERE offender_id = $1", [id])

      // Finally delete the offender
      await query("DELETE FROM offenders WHERE id = $1", [id])

      await query("COMMIT")
    } catch (error) {
      await query("ROLLBACK")
      throw error
    }

    return NextResponse.json({
      message: "Offender and all related records deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting offender:", error)
    return NextResponse.json({ error: "Failed to delete offender" }, { status: 500 })
  }
}

