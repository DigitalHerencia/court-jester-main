import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No notification IDs provided" }, { status: 400 });
    }

    // Mark all specified notifications as read using placeholders
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
    await query(`UPDATE notifications SET read = true WHERE id IN (${placeholders})`, ids);

    return NextResponse.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 });
  }
}
