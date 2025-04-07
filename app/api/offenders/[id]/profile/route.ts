import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Retrieve and verify the token from cookies
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
        
    if (!session || session.role !== "offender") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // If the user is an offender, ensure they can only access their own profile
    if (session.role === "offender" && String(session.offenderId) !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get offender by ID
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
      [params.id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Get cases for this offender
    const casesResult = await query(
      `SELECT 
          id,
          case_number as "caseNumber",
          court,
          status,
          next_date as "nextDate"
        FROM cases 
        WHERE offender_id = $1 
        ORDER BY created_at DESC`,
      [params.id]
    )
    
    return NextResponse.json({
      offender: result.rows[0],
      cases: casesResult.rows,
    })
  } catch (error) {
    console.error("Error fetching offender:", error)
    return NextResponse.json({ error: "Failed to fetch offender" }, { status: 500 })
  }
}
