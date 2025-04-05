import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { pool } from "@/lib/db/db";
import { createTablesSQL } from "@/lib/db/db-schema";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // This is a destructive action, so we require additional confirmation
  const { confirmation } = await request.json();

  if (confirmation !== "RESET DATABASE") {
    return NextResponse.json({ success: false, error: "Invalid confirmation" }, { status: 400 });
  }

  if (!pool) {
    throw new Error("Pool is not initialized");
  }

  try {
    // Get a client from the pool
    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query("BEGIN");

      // Drop all tables in the schema using the correct table names
      await client.query(`
        DROP TABLE IF EXISTS notifications CASCADE;
        DROP TABLE IF EXISTS motion_filings CASCADE;
        DROP TABLE IF EXISTS motion_templates CASCADE;
        DROP TABLE IF EXISTS charges CASCADE;
        DROP TABLE IF EXISTS hearings CASCADE;
        DROP TABLE IF EXISTS login_activity CASCADE;
        DROP TABLE IF EXISTS offenses CASCADE;
        DROP TABLE IF EXISTS tasks CASCADE;
        DROP TABLE IF EXISTS configs CASCADE;
        DROP TABLE IF EXISTS cases CASCADE;
        DROP TABLE IF EXISTS offenders CASCADE;
      `);

      // Recreate tables
      await client.query(createTablesSQL);

      // Commit the transaction
      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message: "Database reset successfully",
      });
    } catch (error) {
      // Rollback in case of error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error: unknown) {
    console.error("Error resetting database:", error);
    return NextResponse.json({ success: false, error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
