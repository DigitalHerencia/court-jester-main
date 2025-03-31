import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  if (!session || (session.role !== "admin" && session.offenderId !== Number(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get query parameters for filtering templates
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Base query for all motion templates
    let queryText = `
      SELECT id, title, category, created_at, updated_at
      FROM motions
      WHERE is_template = true
    `
    const queryParams: unknown[] = []

    if (category) {
      queryText += " AND category = $1"
      queryParams.push(category)
    }
    queryText += " ORDER BY category, title"

    const result = await query(queryText, queryParams)

    // Get distinct categories for filtering (optional feature)
    const categoriesResult = await query(`SELECT DISTINCT category FROM motions WHERE is_template = true`)

    return NextResponse.json({
      templates: result.rows,
      categories: categoriesResult.rows.map((row) => row.category),
    })
  } catch (error) {
    console.error("Error fetching motion templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

