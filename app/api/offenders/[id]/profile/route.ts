import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params to get the inmate number from the URL
    const { id } = await params // id is expected to be the inmate number, e.g., "468079"

    // Retrieve and verify the token from cookies
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const session = await verifyToken(token)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    // If the user is an offender, ensure the token's offenderId matches the inmate number in the URL
    if (session.role === "offender" && String(session.offenderId) !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Query the offender by inmate_number rather than the internal row id
    const result = await query(
      `SELECT 
        id,
        inmate_number,
        nmcd_number,
        first_name,
        last_name,
        middle_name,
        status,
        facility,
        age,
        height,
        weight,
        eye_color,
        hair,
        religion,
        education,
        complexion,
        ethnicity,
        alias,
        mugshot_url,
        account_enabled,
        profile_enabled,
        custody_status,
        created_at,
        updated_at
      FROM offenders
      WHERE inmate_number = $1`,
      [id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Transform database column names to camelCase for frontend consistency
    const offender = {
      id: result.rows[0].id,
      inmateNumber: result.rows[0].inmate_number,
      nmcdNumber: result.rows[0].nmcd_number,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      middleName: result.rows[0].middle_name,
      status: result.rows[0].status,
      facility: result.rows[0].facility,
      age: result.rows[0].age,
      height: result.rows[0].height,
      weight: result.rows[0].weight,
      eyeColor: result.rows[0].eye_color,
      hair: result.rows[0].hair,
      religion: result.rows[0].religion,
      education: result.rows[0].education,
      complexion: result.rows[0].complexion,
      ethnicity: result.rows[0].ethnicity,
      alias: result.rows[0].alias,
      mugshotUrl: result.rows[0].mugshot_url,
      accountEnabled: result.rows[0].account_enabled,
      profileEnabled: result.rows[0].profile_enabled,
      custodyStatus: result.rows[0].custody_status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    }

    return NextResponse.json({ offender })
  } catch (error) {
    console.error("Error fetching offender profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch offender profile" },
      { status: 500 }
    )
  }
}
