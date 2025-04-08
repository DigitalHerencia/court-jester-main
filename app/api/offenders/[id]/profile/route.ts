// app/api/offenders/[id]/profile/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db/db";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "offender" || !session.offenderId) {
      console.warn("Unauthorized access attempt to profile API");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT 
        id,
        inmate_number as "inmateNumber",
        nmcd_number as "nmcdNumber",
        first_name as "firstName",
        last_name as "lastName",
        middle_name as "middleName",
        status,
        facility,
        age,
        height,
        weight,
        eye_color as "eyeColor",
        hair,
        religion,
        education,
        complexion,
        ethnicity,
        alias,
        mugshot_url as "mugshotUrl",
        account_enabled as "accountEnabled",
        profile_enabled as "profileEnabled",
        custody_status as "custodyStatus"
      FROM offenders
      WHERE id = $1`,
      [session.offenderId]
    );

    if (result.rowCount === 0) {
      console.warn(`No offender found with id=${session.offenderId}`);
      return NextResponse.json({ error: "Offender not found" }, { status: 404 });
    }

    console.log(`Offender profile loaded: offenderId=${session.offenderId}`);
    return NextResponse.json({ offender: result.rows[0] });
  } catch (error) {
    console.error("Error fetching offender profile:", error);
    return NextResponse.json({ error: "Failed to fetch offender" }, { status: 500 });
  }
}
