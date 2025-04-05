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
    // Get all motion templates from the motion_templates table
    const templates = await query(`
      SELECT * FROM motion_templates
      ORDER BY title
    `);

    return NextResponse.json({
      success: true,
      templates: templates.rows,
    });
  } catch (error: unknown) {
    console.error("Error getting motion templates:", error);
    return NextResponse.json({ success: false, error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, category, content, variables } = await request.json();

    // Validate required fields (note: if you want category to be optional, remove it from this check)
    if (!title || !category || !content) {
      return NextResponse.json({ success: false, error: "Title, category, and content are required" }, { status: 400 });
    }

    // Insert a new template into the motion_templates table.
    const result = await query(
      `INSERT INTO motion_templates (title, category, content, variables)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, category, content, variables || []]
    );

    return NextResponse.json({
      success: true,
      template: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("Error creating motion template:", error);
    return NextResponse.json({ success: false, error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
