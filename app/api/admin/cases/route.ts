import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

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
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get cases with offender names
    const result = await query(
      `
        SELECT 
          c.id, 
          c.case_number, 
          c.offender_id, 
          CONCAT(o.last_name, ', ', o.first_name) AS offender_name,
          c.court, 
          c.judge, 
          c.status, 
          c.next_date, 
          c.created_at
        FROM cases c
        JOIN offenders o ON c.offender_id = o.id
        ORDER BY c.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    )

    // Get total count for pagination
    const countResult = await query("SELECT COUNT(*) FROM cases")
    const total = Number.parseInt(countResult.rows[0].count)

    return NextResponse.json({
      cases: result.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
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

    // Check if it's a file upload
    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload for case parsing
      const formData = await request.formData()
      const caseFile = formData.get("caseFile") as File

      if (!caseFile) {
        return NextResponse.json({ error: "No case file provided" }, { status: 400 })
      }

      // Process the file (in a real implementation, this would parse the PDF)
      // For now, we'll just return a success message
      return NextResponse.json({
        message: "Case file uploaded successfully",
        cases: [],
      })
    }

    // Handle regular case creation
    const body = await request.json()

    // Validate required fields
    const { offender_id, case_number, court, status } = body

    if (!offender_id || !case_number || !court || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if offender exists
    const offenderResult = await query("SELECT id FROM offenders WHERE id = $1", [offender_id])

    if (offenderResult.rowCount === 0) {
      return NextResponse.json({ error: "Offender not found" }, { status: 404 })
    }

    // Check if case number already exists
    const existingCase = await query("SELECT id FROM cases WHERE case_number = $1", [case_number])

    if ((existingCase?.rowCount ?? 0) > 0) {
      return NextResponse.json({ error: "Case with this number already exists" }, { status: 409 })
    }

    // Insert new case
    const result = await query(
      `
        INSERT INTO cases (
          offender_id,
          case_number,
          court,
          judge,
          status,
          next_date,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `,
      [offender_id, case_number, court, body.judge || null, status, body.next_date || null],
    )

    const newCaseId = result.rows[0].id

    // Create notification for offender
    await query(
      `
        INSERT INTO offender_notifications (
          offender_id,
          type,
          message,
          read,
          created_at
        )
        VALUES ($1, $2, $3, $4, NOW())
      `,
      [offender_id, "case_added", `A new case (${case_number}) has been added to your profile.`, false],
    )

    return NextResponse.json(
      {
        id: newCaseId,
        message: "Case created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}

