import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: templateId } = await params;
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get motion template details
    const result = await query(
      `SELECT * FROM motion_templates WHERE id = $1`,
      [templateId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ template: result.rows[0] });
  } catch (error) {
    console.error("Error fetching motion template:", error);
    return NextResponse.json({ error: "An error occurred while fetching the template" }, { status: 500 });
  }
}

// (PUT and DELETE handlers, if implemented, would similarly await params and handle updates/deletions on motion_templates)
