import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get template details
    const result = await query(
      `
      SELECT 
        id, 
        title, 
        content, 
        category, 
        variables, 
        is_active, 
        created_at, 
        updated_at
      FROM motion_templates 
      WHERE id = $1
    `,
      [params.id],
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    })
  } catch (error: any) {
    console.error("Error fetching motion template:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Update template
    const result = await query(
      `UPDATE motion_templates 
       SET 
         title = $1, 
         category = $2, 
         content = $3, 
         variables = $4, 
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, category, content, JSON.stringify(variables), params.id],
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    })
  } catch (error: any) {
    console.error("Error updating motion template:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get("token")?.value
  const session = await requireAdmin(token)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete template
    const result = await query(`DELETE FROM motion_templates WHERE id = $1 RETURNING id`, [params.id])

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting motion template:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

