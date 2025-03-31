import { type NextRequest, NextResponse } from "next/server"
import { requireOffender } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; templateId: string }> }) {
  const { id, templateId } = await params
  const token = request.cookies.get("token")?.value
  const session = await requireOffender(token)

  // Ensure the user is authorized to access this offender's data
  if (!session || (session.role !== "admin" && session.offenderId !== Number(id))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch template details
    const result = await query(
      `SELECT id, title, content, category, created_at, updated_at FROM motions WHERE id = $1 AND is_template = true`,
      [templateId],
    )
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }
    return NextResponse.json({ template: result.rows[0] })
  } catch (error) {
    console.error("Error fetching motion template:", error)
    return NextResponse.json({ error: "An error occurred while fetching the template" }, { status: 500 })
  }
}

