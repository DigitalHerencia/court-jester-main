import { type NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/db";
import { verifyToken } from "@/lib/auth";
import { parseCasePdf } from "@/lib/pdf-parser";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit")) || 50;
    const offset = Number(searchParams.get("offset")) || 0;
    const search = searchParams.get("search") || "";

    // Build the query based on search parameters
    let queryString = `
      SELECT 
        c.id, 
        c.case_number, 
        c.offender_id,
        CONCAT(o.last_name, ', ', o.first_name) as offender_name,
        c.court,
        c.judge,
        c.status,
        c.next_date,
        c.created_at,
        c.updated_at
      FROM cases c
      JOIN offenders o ON c.offender_id = o.id
    `;
    const queryParams: any[] = [];

    if (search) {
      queryString += ` 
        WHERE c.case_number ILIKE $1 
        OR o.last_name ILIKE $1 
        OR o.first_name ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }

    queryString += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Execute the query
    const result = await query(queryString, queryParams);

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM cases c
       JOIN offenders o ON c.offender_id = o.id
       ${search ? 'WHERE c.case_number ILIKE $1 OR o.last_name ILIKE $1 OR o.first_name ILIKE $1' : ''}`,
      search ? [`%${search}%`] : []
    );

    return NextResponse.json({
      cases: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit,
        offset,
        hasMore: offset + limit < parseInt(countResult.rows[0].count)
      }
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle multipart form data
    const formData = await request.formData();
    const caseFile = formData.get("caseFile") as File;
    const offenderId = formData.get("offenderId") as string;

    if (!caseFile || !offenderId) {
      return NextResponse.json(
        { error: "Case file and offender ID are required" },
        { status: 400 }
      );
    }

    // Convert the file to text
    const text = await caseFile.text();

    // Parse the PDF and create case records
    const result = await parseCasePdf(text, parseInt(offenderId));

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to parse case file", details: result.error },
        { status: 400 }
      );
    }

    // Get the created case details
    const caseResult = await query(
      `SELECT c.*, 
              o.first_name, 
              o.last_name,
              (
                SELECT json_agg(ch.*) 
                FROM charges ch 
                WHERE ch.case_id = c.id
              ) as charges,
              (
                SELECT json_agg(h.*) 
                FROM hearings h 
                WHERE h.case_id = c.id
              ) as hearings
       FROM cases c
       JOIN offenders o ON c.offender_id = o.id
       WHERE c.id = $1`,
      [result.caseId]
    );

    if (caseResult.rowCount === 0) {
      return NextResponse.json({ error: "Failed to create case" }, { status: 500 });
    }

    return NextResponse.json({
      message: "Case file uploaded and processed successfully",
      case: caseResult.rows[0]
    });
  } catch (error) {
    console.error("Error processing case upload:", error);
    return NextResponse.json(
      { error: "Failed to process case upload" },
      { status: 500 }
    );
  }
}
