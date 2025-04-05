import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL parameters
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get("q");

    if (!searchQuery) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    // Search cases with matching fields
    const result = await query(
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
          c.created_at
        FROM cases c
        JOIN offenders o ON c.offender_id = o.id
        WHERE 
          c.case_number ILIKE $1 OR
          o.last_name ILIKE $1 OR
          o.first_name ILIKE $1 OR
          c.court ILIKE $1 OR
          c.judge ILIKE $1 OR
          c.status ILIKE $1
        ORDER BY c.created_at DESC
      `,
      [`%${searchQuery}%`]
    );

    return NextResponse.json({
      cases: result.rows,
    });
  } catch (error) {
    console.error("Error searching cases:", error);
    return NextResponse.json({ error: "Failed to search cases" }, { status: 500 });
  }
}
