import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import  {query}  from "@/lib/db/db";
import { parseCasePdf } from "@/lib/pdf-parser";
import { type ParsedCase } from "@/app/admin/dashboard/tools/case-upload/page";

interface DatabaseError extends Error {
  code?: string;
}

interface UploadResponse {
  message?: string;
  case?: ParsedCase;
  warnings?: string[];
  error?: string;
  details?: string;
}

async function insertCaseData(
  db: { query: typeof query }, 
  offenderId: string, 
  parsedCase: ParsedCase
): Promise<void> {
  // Insert main case record
  const caseResult = await db.query(
    `INSERT INTO cases (
      offender_id, case_number, judge, filing_date, court, 
      case_type, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING id`,
    [
      offenderId,
      parsedCase.case_number,
      parsedCase.judge,
      parsedCase.filing_date,
      parsedCase.court,
      parsedCase.case_type,
      'Active',
    ]
  );

  const caseId = caseResult.rows[0].id;

  // Insert related charges
  for (const charge of parsedCase.charges) {
    await db.query(
      `INSERT INTO charges (
        case_id, count_number, statute, description, class,
        charge_date, citation_number, plea, disposition, 
        disposition_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        caseId,
        charge.count_number,
        charge.statute,
        charge.description,
        charge.class,
        charge.charge_date,
        charge.citation_number,
        charge.plea,
        charge.disposition,
        charge.disposition_date,
      ]
    );
  }

  // Insert hearings
  for (const hearing of parsedCase.hearings) {
    await db.query(
      `INSERT INTO hearings (
        case_id, hearing_date, hearing_time, hearing_type,
        hearing_judge, court, court_room, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        caseId,
        hearing.hearing_date,
        hearing.hearing_time,
        hearing.hearing_type,
        hearing.hearing_judge,
        hearing.court,
        hearing.court_room,
      ]
    );
  }

  // Insert motions
  for (const motion of parsedCase.motions) {
    await db.query(
      `INSERT INTO motions (
        case_id, filing_date, title, content, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        caseId,
        motion.filing_date,
        motion.title,
        motion.content,
        motion.status,
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
      'new_case',
      `A new case (${parsedCase.case_number}) has been added to your record.`,
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
    const offenderId = formData.get("offenderId") as string | null;

    if (!file || !offenderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Parse PDF file
    const pdfData = await file.arrayBuffer();
    const result = await parseCasePdf(pdfData);

    if (!result.success || !result.case) {
      return NextResponse.json(
        { error: "Failed to parse case file", details: result.error },
        { status: 400 }
      );
    }

    // Insert data into database
    try {
      await insertCaseData({ query }, offenderId, result.case);

      return NextResponse.json({
        message: "Case file uploaded and processed successfully",
        case: result.case,
        warnings: result.warnings,
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
