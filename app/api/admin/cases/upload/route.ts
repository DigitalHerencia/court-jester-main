// app/api/admin/cases/upload/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db/db";
import { parseCsvBuffer, type ParsedCaseData } from "@/lib/case-parser";

interface DatabaseError extends Error {
  code?: string;
}

interface UploadResponse {
  message?: string;
  caseData?: ParsedCaseData;
  warnings?: string[];
  error?: string;
  details?: string;
}

async function insertCaseData(
  db: { query: typeof query },
  offenderId: number,
  parsedData: ParsedCaseData
): Promise<void> {
  // Insert main case record with better validation
  const caseResult = await db.query(
    `INSERT INTO cases (
      offender_id, case_number, judge, filing_date, court, 
      case_type, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id`,
    [
      offenderId,
      parsedData.caseDetail.case_number?.trim() || 'NO_CASE_NUMBER',
      parsedData.caseDetail.judge?.trim() || null,
      parsedData.caseDetail.filing_date || new Date(),
      parsedData.caseDetail.court?.trim() || 'UNKNOWN',
      parsedData.caseDetail.case_type?.trim() || null,
      parsedData.caseDetail.status?.trim() || 'Active',
    ]
  );

  const caseId = caseResult.rows[0].id;

  // Insert related charges with better validation
  for (const charge of parsedData.charges) {
    await db.query(
      `INSERT INTO charges (
        case_id, count_number, statute, description, class,
        charge_date, citation_number, plea, disposition, 
        disposition_date, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        caseId,
        Math.max(1, parseInt(String(charge.count_number)) || 1), // Ensure valid number, minimum 1
        charge.statute?.trim() || '',
        charge.description?.trim() || '',
        charge.class?.trim() || null,
        charge.charge_date || new Date(),
        charge.citation_number?.trim() || '',
        charge.plea?.trim() || '',
        charge.disposition?.trim() || null,
        charge.disposition_date || null,
      ]
    );
  }

  // Insert hearings with validation
  for (const hearing of parsedData.hearings) {
    await db.query(
      `INSERT INTO hearings (
        case_id, hearing_date, hearing_time, hearing_type,
        hearing_judge, court, court_room, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        caseId,
        hearing.hearing_date || new Date(),
        hearing.hearing_time?.trim() || '',
        hearing.hearing_type?.trim() || '',
        hearing.hearing_judge?.trim() || '',
        hearing.court?.trim() || '',
        hearing.court_room?.trim() || '',
      ]
    );
  }

  // Insert motion filings with validation
  for (const motion of parsedData.motionFilings) {
    await db.query(
      `INSERT INTO motion_filings (
        case_id, filing_date, title, content, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        caseId,
        motion.filing_date || new Date(),
        motion.title?.trim() || 'Untitled Motion',
        motion.content?.trim() || '',
        motion.status?.trim() || 'Draft',
      ]
    );
  }

  // Create notification
  await db.query(
    `INSERT INTO notifications (
      user_id, type, message, read, created_at
    ) VALUES ($1, $2, $3, $4, NOW())`,
    [
      offenderId,
      "new_case",
      `A new case (${parsedData.caseDetail.case_number}) has been added to your record.`,
      false,
    ]
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Verify admin authorization
    const token = request.cookies.get("token")?.value;
    const session = await verifyToken(token);

    if (!session?.role || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate form data
    const formData = await request.formData();
    const file = formData.get("caseFile") as File | null;
    const offenderIdStr = formData.get("offenderId") as string | null;

    if (!file || !offenderIdStr) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (file.type !== "text/csv") {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    // Convert ArrayBuffer to Buffer and parse the CSV file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parsedData = await parseCsvBuffer(buffer);

    if (!parsedData || !parsedData.caseDetail) {
      return NextResponse.json(
        { error: "Failed to parse case file" },
        { status: 400 }
      );
    }

    // Insert data into database
    try {
      await insertCaseData({ query }, parseInt(offenderIdStr, 10), parsedData);

      return NextResponse.json({
        message: "Case file uploaded and processed successfully",
        caseData: parsedData,
      });
    } catch (error) {
      const dbError = error as DatabaseError;
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save case data to database", details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    const e = error as Error;
    console.error("Error processing case upload:", e);
    return NextResponse.json(
      { 
        error: "Failed to process case upload",
        details: e.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
