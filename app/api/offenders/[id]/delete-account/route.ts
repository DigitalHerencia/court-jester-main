import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { requireOffender } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify authorization
    const token = request.cookies.get("token")?.value
    const session = await requireOffender(token, Number.parseInt(params.id))

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const offenderId = params.id

    // Start transaction
    await query("BEGIN")

    try {
      // Delete related records first
      await query("DELETE FROM login_activity WHERE offender_id = $1", [offenderId])
      await query("DELETE FROM offender_settings WHERE offender_id = $1", [offenderId])
      await query("DELETE FROM motion_downloads WHERE offender_id = $1", [offenderId])
      await query("DELETE FROM past_offenses WHERE offender_id = $1", [offenderId])

      // Delete cases and related records
      const cases = await query("SELECT id FROM cases WHERE offender_id = $1", [offenderId])
      for (const caseRow of cases.rows) {
        await query("DELETE FROM motions WHERE case_id = $1", [caseRow.id])
        await query("DELETE FROM court_dates WHERE case_id = $1", [caseRow.id])
      }
      await query("DELETE FROM cases WHERE offender_id = $1", [offenderId])

      // Delete notifications
      await query("DELETE FROM notifications WHERE recipient_type = 'offender' AND recipient_id = $1", [offenderId])

      // Finally delete the offender
      await query("DELETE FROM offenders WHERE id = $1", [offenderId])

      // Commit transaction
      await query("COMMIT")

      return NextResponse.json({
        success: true,
        message: "Account deleted successfully",
      })
    } catch (error) {
      // Rollback on error
      await query("ROLLBACK")
      throw error
    }
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}

