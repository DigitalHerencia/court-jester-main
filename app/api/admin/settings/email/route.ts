import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch email settings from database
    const result = await query(`
      SELECT 
        smtp_host, 
        smtp_port, 
        smtp_user, 
        smtp_password, 
        from_email, 
        from_name
      FROM email_settings
      LIMIT 1
    `);

    // If no settings exist, return default values
    const settings =
      (result.rowCount ?? 0) > 0
        ? result.rows[0]
        : {
            smtp_host: "",
            smtp_port: 587,
            smtp_user: "",
            smtp_password: "",
            from_email: "",
            from_name: "Court Jester",
          };

    // Mask the password for security
    if (settings.smtp_password) {
      settings.smtp_password = "••••••••";
    }

    return NextResponse.json({
      settings,
    });
  } catch (error) {
    console.error("Error fetching email settings:", error);
    return NextResponse.json({ error: "An error occurred while fetching email settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const session = await requireAdmin(token);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body.settings) {
      return NextResponse.json({ error: "Missing settings object" }, { status: 400 });
    }

    const { settings } = body;

    // Validate settings
    if (!settings.smtp_host || !settings.smtp_port || !settings.from_email) {
      return NextResponse.json({ error: "Missing required email settings" }, { status: 400 });
    }

    // Check if settings already exist
    const checkResult = await query("SELECT COUNT(*) as count FROM email_settings");
    const exists = Number.parseInt(String(checkResult.rows[0].count)) > 0;

    let result;
    if (exists) {
      // Update existing settings; if the smtp_password value is the masked string, retain the current value.
      result = await query(
        `UPDATE email_settings SET 
          smtp_host = $1, 
          smtp_port = $2, 
          smtp_user = $3, 
          smtp_password = CASE WHEN $4 = '••••••••' THEN smtp_password ELSE $4 END, 
          from_email = $5, 
          from_name = $6, 
          updated_at = NOW()
        RETURNING *`,
        [
          settings.smtp_host,
          settings.smtp_port,
          settings.smtp_user,
          settings.smtp_password,
          settings.from_email,
          settings.from_name,
        ]
      );
    } else {
      // Insert new settings
      result = await query(
        `INSERT INTO email_settings (
          smtp_host, 
          smtp_port, 
          smtp_user, 
          smtp_password, 
          from_email, 
          from_name, 
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
        RETURNING *`,
        [
          settings.smtp_host,
          settings.smtp_port,
          settings.smtp_user,
          settings.smtp_password,
          settings.from_email,
          settings.from_name,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email settings updated successfully",
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating email settings:", error);
    return NextResponse.json({ error: "An error occurred while updating email settings" }, { status: 500 });
  }
}
