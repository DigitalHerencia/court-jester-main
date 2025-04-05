import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/db"
import { verifyToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; caseId: string } }
) {
  try {
    const token = request.cookies.get("token")?.value
    const session = await verifyToken(token)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.role !== "admin" && session.offenderId !== parseInt(params.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const caseResult = await query(
      `SELECT c.*, 
              o.first_name, 
              o.last_name,
              (
                SELECT json_agg(
                  json_build_object(
                    'id', ch.id,
                    'count_number', ch.count_number,
                    'description', ch.description,
                    'statute', ch.statute,
                    'class', ch.class,
                    'charge_date', ch.charge_date,
                    'citation', ch.citation_number,
                    'disposition', ch.disposition,
                    'disposition_date', ch.disposition_date
                  )
                  ORDER BY ch.count_number
                )
                FROM charges ch 
                WHERE ch.case_id = c.id
              ) as charges,
              (
                SELECT json_agg(
                  json_build_object(
                    'id', h.id,
                    'date', h.hearing_date,
                    'time', h.hearing_time,
                    'type', h.hearing_type,
                    'judge', h.hearing_judge,
                    'location', h.court || CASE WHEN h.court_room IS NOT NULL THEN ' - Room ' || h.court_room ELSE '' END
                  )
                  ORDER BY h.hearing_date, h.hearing_time
                )
                FROM hearings h 
                WHERE h.case_id = c.id
              ) as hearings
       FROM cases c
       JOIN offenders o ON c.offender_id = o.id
       WHERE c.id = $1 AND c.offender_id = $2`,
      [params.caseId, params.id]
    )

    if (!caseResult.rowCount) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const caseData = caseResult.rows[0]

    return NextResponse.json({
      case: {
        id: caseData.id,
        case_number: caseData.case_number,
        court: caseData.court,
        judge: caseData.judge,
        status: caseData.status,
        filing_date: caseData.filing_date,
        next_date: caseData.next_date,
        case_type: caseData.case_type,
        plaintiff: caseData.plaintiff,
        defendant: caseData.defendant,
        created_at: caseData.created_at,
        updated_at: caseData.updated_at,
        offender: {
          id: caseData.offender_id,
          first_name: caseData.first_name,
          last_name: caseData.last_name
        }
      },
      charges: caseData.charges || [],
      hearings: caseData.hearings || []
    })
  } catch (error) {
    console.error("Error fetching case details:", error)
    return NextResponse.json(
      { error: "Failed to fetch case details" },
      { status: 500 }
    )
  }
}
