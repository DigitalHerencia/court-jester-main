import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await query(
      `
      UPDATE notifications
      SET read = true
      WHERE id = $1
    `,
      [params.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

