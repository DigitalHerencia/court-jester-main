import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;
    const search = searchParams.get("search") || "";

    let queryString = `
      SELECT 
        c.id, 
        c.case_number, 
        c.offender_id,
        CONCAT(o.last_name, ', ', o.first_name) as offender_name,
        c.court,
        c.judge,
        c.status,
        c.next_date,
        c.created_at,
        c.updated_at,
        c.case_type,
        c.plaintiff,
        c.defendant
      FROM cases c
      JOIN offenders o ON c.offender_id = o.id
    `;
    const queryParams: any[] = [];

    if (search) {
      queryString += ` 
        WHERE c.case_number ILIKE $1 
        OR o.last_name ILIKE $1 
        OR o.first_name ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }

    queryString += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await query(queryString, queryParams);

    const countResult = await query(
      `SELECT COUNT(*) FROM cases c
       JOIN offenders o ON c.offender_id = o.id
       ${search ? 'WHERE c.case_number ILIKE $1 OR o.last_name ILIKE $1 OR o.first_name ILIKE $1' : ''}`,
      search ? [`%${search}%`] : []
    );

    return NextResponse.json({
      cases: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit,
        offset,
        hasMore: offset + limit < parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}
