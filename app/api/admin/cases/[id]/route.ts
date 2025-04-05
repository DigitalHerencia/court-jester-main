import { type NextRequest, NextResponse } from "next/server";
import { query, transaction } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get case details along with offender information
    const caseResult = await query(
      `
        SELECT 
          c.id, 
          c.case_number, 
          c.offender_id, 
          CONCAT(o.last_name, ', ', o.first_name) AS offender_name,
          c.court, 
          c.judge, 
          c.status, 
          c.next_date, 
          c.created_at,
          c.updated_at
        FROM cases c
        JOIN offenders o ON c.offender_id = o.id
        WHERE c.id = $1
      `,
      [id]
    );

    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Get related charges, hearings, and motion filings
    const chargesResult = await query(
      `SELECT id, description, statute, disposition FROM charges WHERE case_id = $1`,
      [id]
    );
    const hearingsResult = await query(
      `SELECT id, hearing_time, hearing_type, hearing_judge FROM hearings WHERE case_id = $1 ORDER BY hearing_date ASC`,
      [id]
    );
    const motionFilingsResult = await query(
      `SELECT id, title, status, created_at, updated_at FROM motion_filings WHERE case_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return NextResponse.json({
      case: caseResult.rows[0],
      charges: chargesResult.rows,
      hearings: hearingsResult.rows,
      motions: motionFilingsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return NextResponse.json({ error: "Failed to fetch case details" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const caseData = await request.json();
    
    // Update case details
    await query(
      `UPDATE cases 
       SET court = $1,
           judge = $2,
           status = $3,
           filing_date = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND offender_id = $6
       RETURNING id`,
      [
        caseData.court,
        caseData.judge,
        caseData.status,
        caseData.filing_date ? new Date(caseData.filing_date) : null,
        id,
        caseData.offender_id
      ]
    );

    // If case is closed, update all pending charges to dismissed
    if (caseData.status === "Closed") {
      await query(
        `UPDATE charges
         SET disposition = 'Dismissed',
             updated_at = CURRENT_TIMESTAMP
         WHERE case_id = $1 AND (disposition IS NULL OR disposition = 'Pending')`,
        [id]
      );
    }

    // Create notification for status change
    await query(
      `INSERT INTO notifications (
        user_id, type, message, read
      ) VALUES ($1, $2, $3, $4)`,
      [
        caseData.offender_id,
        'case_update',
        `Case #${caseData.case_number} has been updated. Status: ${caseData.status}`,
        false
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json({ error: "Failed to update case" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if case exists
    const existingCase = await query("SELECT id, offender_id, case_number FROM cases WHERE id = $1", [id]);
    if (existingCase.rowCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    const { offender_id, case_number } = existingCase.rows[0];

    // Delete case and related records using a transaction
    await transaction(async (client) => {
      await client.query("DELETE FROM motion_filings WHERE case_id = $1", [id]);
      await client.query("DELETE FROM hearings WHERE case_id = $1", [id]);
      await client.query("DELETE FROM charges WHERE case_id = $1", [id]);
      await client.query("DELETE FROM cases WHERE id = $1", [id]);
      await client.query(
        `
          INSERT INTO notifications (
            user_id,
            type,
            message,
            read,
            created_at
          )
          VALUES ($1, $2, $3, $4, NOW())
        `,
        [offender_id, "case_deleted", `Case #${case_number} was deleted.`, false]
      );
    });

    return NextResponse.json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json({ error: "Failed to delete case" }, { status: 500 });
  }
}
