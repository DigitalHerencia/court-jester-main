import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get table statistics
    const tableStats = await query(`
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
        (SELECT pg_total_relation_size(quote_ident(t.table_name))) AS size_bytes,
        (
          CASE 
            WHEN t.table_name = 'offenders' THEN (SELECT COUNT(*) FROM offenders)
            WHEN t.table_name = 'cases' THEN (SELECT COUNT(*) FROM cases)
            WHEN t.table_name = 'motion_filings' THEN (SELECT COUNT(*) FROM motion_filings)
            WHEN t.table_name = 'notifications' THEN (SELECT COUNT(*) FROM notifications)
            ELSE 0
          END
        ) AS row_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    return NextResponse.json({
      success: true,
      tables: tableStats.rows,
    });
  } catch (error: unknown) {
    console.error("Error getting database tables:", error);
    return NextResponse.json({ success: false, error: ( error as Error).message || "Internal server error" }, { status: 500 });
  }
}
