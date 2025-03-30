import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; caseId: string }> }) {
  try {
    const { id, caseId } = await params;
    // Verify authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check offender access
    if (session.role === "offender" && session.offenderId !== Number.parseInt(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify the case belongs to the offender
    const caseResult = await query(
      `
        SELECT id, case_number, court, judge, status, next_date, created_at, updated_at
        FROM cases
        WHERE id = $1 AND offender_id = $2
      `,
      [caseId, id]
    );
    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Case not found or does not belong to this offender" }, { status: 404 });
    }

    // Get charges, hearings, motions for this case
    const chargesResult = await query(`SELECT id, description, statute, severity, disposition FROM charges WHERE case_id = $1`, [caseId]);
    const hearingsResult = await query(`SELECT id, date, time, location, type, notes FROM court_dates WHERE case_id = $1 ORDER BY date ASC`, [caseId]);
    const motionsResult = await query(`SELECT id, title, status, created_at, updated_at FROM motions WHERE case_id = $1 ORDER BY created_at DESC`, [caseId]);

    return NextResponse.json({
      case: caseResult.rows[0],
      charges: chargesResult.rows,
      hearings: hearingsResult.rows,
      motions: motionsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return NextResponse.json({ error: "Failed to fetch case details" }, { status: 500 });
  }
}
