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

    // Convert inmate number (params.id) to internal offender id
    const offenderResult = await query(
      `SELECT id FROM offenders WHERE inmate_number = $1`,
      [params.id],
    )
    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }
    const internalOffenderId = offenderResult.rows[0].id

    // Start transaction
    await query("BEGIN")

    try {
      // Delete related records first
      await query("DELETE FROM login_activity WHERE offender_id = $1", [internalOffenderId])
      
      // Removed deletion of offender_settings, motion_downloads, past_offenses (nonexistent tables)

      // Delete cases and related records
      const casesResult = await query("SELECT id FROM cases WHERE offender_id = $1", [internalOffenderId])
      for (const caseRow of casesResult.rows) {
        await query("DELETE FROM motion_filings WHERE case_id = $1", [caseRow.id])
        await query("DELETE FROM hearings WHERE case_id = $1", [caseRow.id])
      }
      await query("DELETE FROM cases WHERE offender_id = $1", [internalOffenderId])

      // Delete notifications (using the correct column 'user_id')
      await query("DELETE FROM notifications WHERE user_id = $1", [internalOffenderId])

      // Finally, delete the offender
      await query("DELETE FROM offenders WHERE id = $1", [internalOffenderId])

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
