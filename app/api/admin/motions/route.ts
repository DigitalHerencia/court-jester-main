import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all motions
    const motions = await query(`
      SELECT 
        m.id, 
        m.title, 
        m.status, 
        m.created_at, 
        m.updated_at,
        c.case_number,
        c.offender_id,
        o.first_name || ' ' || o.last_name as offender_name
      FROM motions m
      JOIN cases c ON m.case_id = c.id
      JOIN offenders o ON c.offender_id = o.id
      ORDER BY m.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      motions: motions.rows,
    })
  } catch (error: unknown) {
    console.error("Error getting motions:", error)
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { case_id, template_id, title, content, variables, status } = await request.json()

    // Validate required fields
    if (!case_id || !title || !content) {
      return NextResponse.json({ error: "Case ID, title, and content are required" }, { status: 400 })
    }

    // Insert new motion
    const result = await query(
      `INSERT INTO motions (
        case_id, 
        template_id, 
        title, 
        content, 
        variables, 
        status, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id`,
      [case_id, template_id, title, content, JSON.stringify(variables), status || "draft"],
    )

    // Get case and offender info for notification
    const caseInfo = await query(
      `SELECT c.case_number, c.offender_id, o.first_name, o.last_name
       FROM cases c
       JOIN offenders o ON c.offender_id = o.id
       WHERE c.id = $1`,
      [case_id],
    )

    if (caseInfo.rowCount ?? 0) {
      const { case_number, offender_id } = caseInfo.rows[0]

      // Create notification for offender
      await query(
        `INSERT INTO notifications (
          recipient_type,
          recipient_id,
          type,
          message,
          read,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          "offender",
          offender_id,
          "motion_created",
          `A new motion "${title}" has been created for your case ${case_number}.`,
          false,
        ],
      )
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: "Motion created successfully",
    })
  } catch (error: unknown) {
    console.error("Error creating motion:", error)
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 })
  }
}

