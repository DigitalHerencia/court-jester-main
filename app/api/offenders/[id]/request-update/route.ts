import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has access to this offender's data
    if (session.role === "offender" && session.offenderId !== Number.parseInt(params.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Check if offender exists
    const offenderResult = await query("SELECT id, first_name, last_name, inmate_number FROM offenders WHERE id = $1", [
      id,
    ])

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    const offender = offenderResult.rows[0]

    // Create an admin notification for the update request
    await query(
      `
        INSERT INTO admin_notifications (
          type,
          message,
          read,
          created_at
        )
        VALUES ($1, $2, $3, NOW())
      `,
      [
        "profile_update_request",
        `Offender ${offender.last_name}, ${offender.first_name} (${offender.inmate_number}) has requested a profile update.`,
        false,
      ],
    )

    // Create a notification for the offender
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
      [
        id,
        "profile_update_request",
        "Your profile update request has been submitted. An administrator will review your request.",
        false,
      ],
    )

    return NextResponse.json({
      message: "Profile update request submitted successfully",
    })
  } catch (error) {
    console.error("Error requesting profile update:", error)
    return NextResponse.json({ error: "Failed to submit profile update request" }, { status: 500 })
  }
}

