import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

interface OffenderData {
  inmateNumber: string
  nmcdNumber?: string
  firstName: string
  lastName: string
  middleName?: string
  status: string
  facility?: string
  age?: number
  height?: string
  weight?: number
  eyeColor?: string
  hair?: string
  religion?: string
  education?: string
  complexion?: string
  ethnicity?: string
  alias?: string
  mugshotUrl?: string
  accountEnabled: boolean
  profileEnabled: boolean
  custodyStatus: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const offender: OffenderData = body.offender

    // Validate required fields
    const requiredFields = ["inmateNumber", "firstName", "lastName", "status", "custodyStatus"]
    const missingFields = requiredFields.filter(field => !offender[field as keyof OffenderData]?.toString().trim())
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    // Check if inmate number exists for a different offender
    const existingOffender = await query(
      `SELECT id FROM offenders WHERE inmate_number = $1 AND id != $2`,
      [offender.inmateNumber, params.id]
    )
    
    if ((existingOffender.rowCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "Another offender with this inmate number already exists" },
        { status: 409 }
      )
    }

    // Update offender
    const result = await query(
      `UPDATE offenders SET
        inmate_number = $1,
        nmcd_number = $2,
        first_name = $3,
        last_name = $4,
        middle_name = $5,
        status = $6,
        facility = $7,
        age = $8,
        height = $9,
        weight = $10,
        eye_color = $11,
        hair = $12,
        religion = $13,
        education = $14,
        complexion = $15,
        ethnicity = $16,
        alias = $17,
        mugshot_url = $18,
        account_enabled = $19,
        profile_enabled = $20,
        custody_status = $21,
        updated_at = NOW()
      WHERE id = $22
      RETURNING id`,
      [
        offender.inmateNumber,
        offender.nmcdNumber || null,
        offender.firstName,
        offender.lastName,
        offender.middleName || null,
        offender.status,
        offender.facility || null,
        offender.age ? parseInt(String(offender.age)) : null,
        offender.height || null,
        offender.weight ? parseInt(String(offender.weight)) : null,
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
        params.id
      ]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Offender updated successfully",
      id: result.rows[0].id
    })
  } catch (error) {
    console.error("Error updating offender:", error)
    return NextResponse.json({ error: "Failed to update offender" }, { status: 500 })
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
    
    // Parse request body
    const { offender } = await request.json()
    
    // Validate required fields
    if (!offender.inmateNumber || !offender.firstName || !offender.lastName || !offender.status) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          inmateNumber: !offender.inmateNumber,
          firstName: !offender.firstName,
          lastName: !offender.lastName,
          status: !offender.status
        }
      }, { status: 400 })
    }
    
    // Check if offender already exists
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
      `INSERT INTO offenders (
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
      RETURNING id`,
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
        offender.custodyStatus || 'in_custody'
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)
    
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete offender
    const result = await query(
      "DELETE FROM offenders WHERE id = $1 RETURNING id",
      [params.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: result.rows[0].id,
      message: "Offender deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting offender:", error)
    return NextResponse.json({ error: "Failed to delete offender" }, { status: 500 })
  }
}