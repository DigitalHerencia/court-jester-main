import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/db/db"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)
    
    // Build query based on search parameter
    let sql = `
      SELECT 
        id, 
        inmate_number, 
        first_name, 
        last_name,
        middle_name,
        status, 
        facility,
        custody_status,
        created_at
      FROM offenders
    `
    
    const queryParams: any[] = []
    
    if (search) {
      sql += `
        WHERE 
          inmate_number ILIKE $1 OR
          last_name ILIKE $1 OR
          first_name ILIKE $1 OR
          facility ILIKE $1
      `
      queryParams.push(`%${search}%`)
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`
    queryParams.push(limit, offset)
    
    // Execute query
    const result = await query(sql, queryParams)
    
    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM offenders ${
        search
          ? "WHERE inmate_number ILIKE $1 OR last_name ILIKE $1 OR first_name ILIKE $1 OR facility ILIKE $1"
          : ""
      }`,
      search ? [`%${search}%`] : []
    )
    
    const total = Number.parseInt(String(countResult.rows[0].count))
    
    return NextResponse.json({
      offenders: result.rows,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error("Error fetching offenders:", error)
    return NextResponse.json({ error: "Failed to fetch offenders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const offender = body.offender

    // Validate required fields
    const requiredFields = ["inmateNumber", "firstName", "lastName", "status", "custodyStatus"]
    const missingFields = requiredFields.filter(field => !offender[field]?.trim())
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    // Check if offender with this inmate number already exists
    const existingOffender = await query(
      "SELECT id FROM offenders WHERE inmate_number = $1",
      [offender.inmateNumber]
    )
    
    if ((existingOffender.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Offender with this inmate number already exists" },
        { status: 409 }
      )
    }
    
    // Insert new offender
    const result = await query(
      `
      INSERT INTO offenders (
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())
      RETURNING id
      `,
      [
        offender.inmateNumber,
        offender.nmcdNumber || null,
        offender.firstName,
        offender.lastName,
        offender.middleName || null,
        offender.status,
        offender.facility || null,
        offender.age ? parseInt(offender.age) : null,
        offender.height || null,
        offender.weight ? parseInt(offender.weight) : null,
        offender.eyeColor || null,
        offender.hair || null,
        offender.religion || null,
        offender.education || null,
        offender.complexion || null,
        offender.ethnicity || null,
        offender.alias || null,
        offender.mugshotUrl || null,
        offender.accountEnabled,
        offender.profileEnabled,
        offender.custodyStatus,
      ]
    )
    
    const newOffenderId = result.rows[0].id
    
    return NextResponse.json(
      {
        id: newOffenderId,
        message: "Offender created successfully"
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating offender:", error)
    return NextResponse.json({ error: "Failed to create offender" }, { status: 500 })
  }
}
