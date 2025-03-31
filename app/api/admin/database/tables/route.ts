import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get table information
    const tablesResult = await query(`
      SELECT 
        table_name AS name,
        pg_relation_size(quote_ident(table_name)) AS raw_size
      FROM 
        information_schema.tables
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name
    `)

    // For each table, get the row count
    const tables = await Promise.all(
      tablesResult.rows.map(async (table) => {
        const countResult = await query(`SELECT COUNT(*) FROM "${table.name}"`)
        const rowCount = Number.parseInt(countResult.rows[0].count, 10)

        // Format the size
        let size = table.raw_size
        let sizeStr = `${size} bytes`
        if (size > 1024) {
          size = size / 1024
          sizeStr = `${size.toFixed(2)} KB`
        }
        if (size > 1024) {
          size = size / 1024
          sizeStr = `${size.toFixed(2)} MB`
        }

        // Get the last updated time (using the most recent updated_at from the table if it exists)
        let lastUpdated = "Unknown"
        try {
          if (await columnExists(table.name, "updated_at")) {
            const updateResult = await query(`
              SELECT updated_at 
              FROM "${table.name}" 
              ORDER BY updated_at DESC 
              LIMIT 1
            `)
            if (updateResult.rows.length > 0) {
              lastUpdated = new Date(updateResult.rows[0].updated_at).toLocaleString()
            }
          } else if (await columnExists(table.name, "created_at")) {
            const createResult = await query(`
              SELECT created_at 
              FROM "${table.name}" 
              ORDER BY created_at DESC 
              LIMIT 1
            `)
            if (createResult.rows.length > 0) {
              lastUpdated = new Date(createResult.rows[0].created_at).toLocaleString()
            }
          }
        } catch (error) {
          console.error(`Error getting last updated time for ${table.name}:`, error)
        }

        return {
          name: table.name,
          rows: rowCount,
          size: sizeStr,
          lastUpdated,
        }
      }),
    )

    return NextResponse.json({ tables }, { status: 200 })
  } catch (error) {
    console.error("Error fetching database tables:", error)
    return NextResponse.json({ error: "Failed to fetch database tables" }, { status: 500 })
  }
}

// Helper function to check if a column exists in a table
async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await query(
    `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = $1 AND column_name = $2
  `,
    [tableName, columnName],
  )

  return result.rows.length > 0
}

