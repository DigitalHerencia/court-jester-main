import { type NextRequest, NextResponse } from "next/server";
import { query, checkConnection } from "@/lib/db/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Verify admin authorization first
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check connection and get metadata
    const _connectionInfo = await checkConnection();
    const metadata = await query(`
      SELECT version() as version,
             current_database() as database,
             current_user as user,
             current_setting('timezone') as timezone
    `);

    return NextResponse.json({
      success: true,
      connected: true,
      metadata: metadata.rows[0]
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: "Unable to connect to database"
    }, { status: 500 });
  }
}
