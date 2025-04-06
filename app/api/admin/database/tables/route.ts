import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get comprehensive table statistics
    const tableStats = await query(`
      WITH table_stats AS (
        SELECT
          t.table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count,
          (SELECT pg_total_relation_size(quote_ident(t.table_name))) AS size_bytes,
          pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name))) AS size_formatted,
          (
            CASE 
              WHEN t.table_name = 'offenders' THEN (SELECT COUNT(*) FROM offenders)
              WHEN t.table_name = 'cases' THEN (SELECT COUNT(*) FROM cases)
              WHEN t.table_name = 'motion_filings' THEN (SELECT COUNT(*) FROM motion_filings)
              WHEN t.table_name = 'motion_templates' THEN (SELECT COUNT(*) FROM motion_templates)
              WHEN t.table_name = 'notifications' THEN (SELECT COUNT(*) FROM notifications)
              WHEN t.table_name = 'hearings' THEN (SELECT COUNT(*) FROM hearings)
              WHEN t.table_name = 'charges' THEN (SELECT COUNT(*) FROM charges)
              ELSE 0
            END
          ) AS row_count,
          obj_description(quote_ident(t.table_name)::regclass::oid, 'pg_class') AS description,
          age(now(), greatest(
            COALESCE((SELECT MAX(created_at) FROM (SELECT created_at FROM cases WHERE created_at IS NOT NULL
                                                  UNION ALL
                                                  SELECT created_at FROM offenders WHERE created_at IS NOT NULL
                                                  UNION ALL
                                                  SELECT created_at FROM motion_filings WHERE created_at IS NOT NULL
                                                  UNION ALL
                                                  SELECT created_at FROM notifications WHERE created_at IS NOT NULL) AS dates), now()),
            COALESCE((SELECT MAX(updated_at) FROM (SELECT updated_at FROM cases WHERE updated_at IS NOT NULL
                                                  UNION ALL
                                                  SELECT updated_at FROM offenders WHERE updated_at IS NOT NULL
                                                  UNION ALL
                                                  SELECT updated_at FROM motion_filings WHERE updated_at IS NOT NULL) AS dates), now())
          )) AS last_activity
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      )
      SELECT 
        table_name,
        column_count,
        size_bytes,
        size_formatted,
        row_count,
        description,
        CASE 
          WHEN last_activity < interval '1 minute' THEN 'Just now'
          WHEN last_activity < interval '1 hour' THEN extract(minute from last_activity)::text || ' minutes ago'
          WHEN last_activity < interval '1 day' THEN extract(hour from last_activity)::text || ' hours ago'
          ELSE extract(day from last_activity)::text || ' days ago'
        END as last_activity
      FROM table_stats
      ORDER BY table_name
    `)

    return NextResponse.json({
      success: true,
      tables: tableStats.rows,
      summary: {
        totalTables: tableStats.rowCount,
        totalRows: tableStats.rows.reduce((sum, table) => sum + Number(table.row_count), 0),
        totalSize: tableStats.rows.reduce((sum, table) => sum + Number(table.size_bytes), 0)
      }
    })
  } catch (error) {
    console.error("Error getting database tables:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 })
  }
}
