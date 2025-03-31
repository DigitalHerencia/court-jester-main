import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all motion templates
    const templates = await query(`
      SELECT 
        id, 
        title, 
        content, 
        category, 
        created_at, 
        updated_at, 
        is_active
      FROM motion_templates
      ORDER BY title
    `)

    return NextResponse.json({
      success: true,
      templates: templates.rows,
    })
  } catch (error: any) {
    console.error("Error getting motion templates:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, category, content } = await request.json()

    // Validate required fields
    if (!title || !category || !content) {
      return NextResponse.json({ error: "Title, category, and content are required" }, { status: 400 })
    }

    // Extract variables from content
    const variableMatches = content.match(/{{([^}]+)}}/g) || []
    const variables = variableMatches.map((match: string) => match.slice(2, -2).trim())

    // Insert new template
    const result = await query(
      `INSERT INTO motion_templates (
        title, 
        category, 
        content, 
        variables, 
        is_active, 
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [title, category, content, JSON.stringify(variables), true],
    )

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    })
  } catch (error: any) {
    console.error("Error creating motion template:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

