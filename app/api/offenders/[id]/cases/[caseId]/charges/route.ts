// ✅ Path: app/api/offenders/[id]/cases/[caseId]/charges/route.ts

"use server";

import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; caseId: string }> }
) {
  try {
    const { id, caseId } = await context.params;

    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role === "offender" && session.offenderId !== Number(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify that the case belongs to this offender.
    const caseResult = await query(
      "SELECT id FROM cases WHERE id = $1 AND offender_id = $2",
      [Number(caseId), Number(id)]
    );
    if (caseResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Case not found or does not belong to this offender" },
        { status: 404 }
      );
    }

    const chargesResult = await query(
      `SELECT 
          id, 
          description, 
          statute, 
          class, 
          citation_number,
          disposition,
          charge_date
        FROM charges
        WHERE case_id = $1`,
      [Number(caseId)]
    );

    return NextResponse.json({ charges: chargesResult.rows });
  } catch (error) {
    console.error("Error fetching case charges:", error);
    return NextResponse.json({ error: "Failed to fetch case charges" }, { status: 500 });
  }
}
