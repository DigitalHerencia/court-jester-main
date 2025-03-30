import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the inmate number from the URL
    const { id } = await params; // id is expected to be the inmate number, e.g., "468079"

    // Retrieve and verify the token from cookies
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifyToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // If the user is an offender, ensure the token's offenderId matches the inmate number in the URL.
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Query the offender by inmate_number rather than the internal row id.
    // Note: Removed "date_of_birth" because that column does not exist.
    const result = await query(
      `
      SELECT 
        id,
        inmate_number,
        nmcd_number,
        first_name,
        last_name,
        middle_name,
        status,
        custody_status,
        account_enabled,
        profile_enabled,
        facility,
        age,
        ethnicity,
        mugshot_url
      FROM offenders
      WHERE inmate_number = $1
      `,
      [id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching offender profile:", error);
    return NextResponse.json({ error: "Failed to fetch offender profile" }, { status: 500 });
  }
}
