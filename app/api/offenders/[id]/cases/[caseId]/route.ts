// ✅ Path: app/api/offenders/[id]/cases/[caseId]/route.ts

"use server";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; caseId: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await the params per Next.js 15 guidelines
    const { id, caseId } = await context.params;

    if (session.role === "offender" && session.offenderId !== Number(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const offenderId = Number(id);
    const caseIdNum = Number(caseId);

    const sql = `
      WITH aggregated_charges AS (
        SELECT
          ch.case_id,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ch.id,
              'description', ch.description,
              'statute', ch.statute,
              'class', ch.class,
              'citation_number', ch.citation_number,
              'disposition', ch.disposition,
              'charge_date', ch.charge_date
            )
          ) AS charges
        FROM charges ch
        GROUP BY ch.case_id
      )
      SELECT
        c.id,
        c.case_number,
        c.offender_id,
        CONCAT(o.last_name, ', ', o.first_name) AS offender_name,
        c.court,
        c.judge,
        c.next_date,
        c.created_at,
        COALESCE(ac.charges, '[]'::json) AS charges
      FROM cases c
      JOIN offenders o ON c.offender_id = o.id
      LEFT JOIN aggregated_charges ac ON c.id = ac.case_id
      WHERE c.id = $1 AND c.offender_id = $2;
    `;

    const caseResult = await query(sql, [caseIdNum, offenderId]);
    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    return NextResponse.json({ data: caseResult.rows[0] });
  } catch (error) {
    console.error("Error fetching case details:", error);
    return NextResponse.json({ error: "Failed to fetch case details" }, { status: 500 });
  }
}
